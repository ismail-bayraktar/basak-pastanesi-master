import CourierIntegrationConfigModel from '../models/CourierIntegrationConfigModel.js';
import logger from '../utils/logger.js';
import { setInNamespace, getFromNamespace, deleteFromNamespace, isRedisAvailable } from '../config/redis.js';

/**
 * Circuit Breaker Service
 * Implements circuit breaker pattern to prevent cascading failures
 * States: CLOSED (normal), OPEN (failing), HALF_OPEN (testing)
 *
 * Now uses Redis for distributed state management to support horizontal scaling
 */

class CircuitBreaker {
    constructor(platform, config = {}) {
        this.platform = platform;
        this.useRedis = isRedisAvailable();

        // In-memory state (fallback when Redis unavailable)
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.lastStateChange = Date.now();
        this.requestCount = 0;

        // Configuration with defaults
        this.config = {
            failureThreshold: config.failureThreshold || 5,
            timeout: config.timeout || 60000, // 60 seconds
            halfOpenRequests: config.halfOpenRequests || 1,
            resetTimeout: config.resetTimeout || 120000, // 2 minutes for full reset
            windowSize: config.windowSize || 60000, // 1 minute sliding window
            enabled: config.enabled !== false // Enabled by default
        };

        // Failure tracking for sliding window
        this.failureTimestamps = [];

        // Metrics for monitoring
        this.metrics = {
            totalRequests: 0,
            totalFailures: 0,
            totalSuccesses: 0,
            stateChanges: [],
            lastOpenedAt: null,
            lastClosedAt: null,
            totalTimeOpen: 0,
            totalTimeClosed: 0
        };

        // Redis key namespace
        this.redisNamespace = 'circuitbreaker';

        // Load state from Redis on initialization
        if (this.useRedis) {
            this.loadFromRedis().catch(err => {
                logger.warn('Failed to load circuit breaker state from Redis, using defaults', {
                    platform: this.platform,
                    error: err.message
                });
            });
        }
    }

    /**
     * Load circuit breaker state from Redis
     */
    async loadFromRedis() {
        try {
            const stateData = await getFromNamespace(this.redisNamespace, `${this.platform}:state`);

            if (stateData) {
                this.state = stateData.state || 'CLOSED';
                this.failureCount = stateData.failureCount || 0;
                this.successCount = stateData.successCount || 0;
                this.lastFailureTime = stateData.lastFailureTime || null;
                this.lastStateChange = stateData.lastStateChange || Date.now();
                this.failureTimestamps = stateData.failureTimestamps || [];
                this.metrics = stateData.metrics || this.metrics;

                logger.debug('Circuit breaker state loaded from Redis', {
                    platform: this.platform,
                    state: this.state
                });
            }
        } catch (error) {
            logger.error('Error loading circuit breaker state from Redis', {
                platform: this.platform,
                error: error.message
            });
        }
    }

    /**
     * Save circuit breaker state to Redis
     */
    async saveToRedis() {
        if (!this.useRedis) return;

        try {
            const stateData = {
                state: this.state,
                failureCount: this.failureCount,
                successCount: this.successCount,
                lastFailureTime: this.lastFailureTime,
                lastStateChange: this.lastStateChange,
                failureTimestamps: this.failureTimestamps,
                metrics: this.metrics,
                updatedAt: Date.now()
            };

            // Save with TTL of 24 hours
            await setInNamespace(this.redisNamespace, `${this.platform}:state`, stateData, 86400);

            logger.debug('Circuit breaker state saved to Redis', {
                platform: this.platform,
                state: this.state
            });
        } catch (error) {
            logger.error('Error saving circuit breaker state to Redis', {
                platform: this.platform,
                error: error.message
            });
        }
    }

    /**
     * Execute operation with circuit breaker protection
     */
    async execute(operation, context = {}) {
        if (!this.config.enabled) {
            // Circuit breaker disabled, execute directly
            return await operation();
        }

        this.metrics.totalRequests++;
        this.requestCount++;

        // Check circuit state
        const currentState = this.getState();

        if (currentState === 'OPEN') {
            // Check if we should transition to HALF_OPEN
            if (this.shouldAttemptReset()) {
                this.transitionTo('HALF_OPEN');
            } else {
                // Reject request immediately
                const error = new Error('Circuit breaker is OPEN');
                error.code = 'CIRCUIT_OPEN';
                error.statusCode = 503;
                error.retryable = true;
                error.retryAfter = this.getTimeUntilReset();

                logger.warn('Circuit breaker rejected request', {
                    platform: this.platform,
                    state: this.state,
                    context,
                    timeUntilReset: error.retryAfter
                });

                throw error;
            }
        }

        // Execute operation
        try {
            const startTime = Date.now();
            const result = await operation();
            const duration = Date.now() - startTime;

            // Record success
            this.onSuccess(duration);

            return result;

        } catch (error) {
            // Record failure
            this.onFailure(error);

            // Re-throw error
            throw error;
        }
    }

    /**
     * Handle successful operation
     */
    onSuccess(duration) {
        this.metrics.totalSuccesses++;
        this.successCount++;

        if (this.state === 'HALF_OPEN') {
            // Success in HALF_OPEN state
            if (this.successCount >= this.config.halfOpenRequests) {
                // Enough successful requests, close circuit
                this.transitionTo('CLOSED');
                logger.info('Circuit breaker recovered', {
                    platform: this.platform,
                    successCount: this.successCount,
                    duration
                });
            }
        } else if (this.state === 'CLOSED') {
            // Reset failure count on success in CLOSED state
            if (this.failureCount > 0) {
                this.failureCount = Math.max(0, this.failureCount - 1);
            }
        }

        logger.debug('Circuit breaker success', {
            platform: this.platform,
            state: this.state,
            successCount: this.successCount,
            failureCount: this.failureCount,
            duration
        });

        // Persist to Redis (async, non-blocking)
        this.saveToRedis().catch(err => {
            logger.warn('Failed to save circuit breaker state after success', {
                platform: this.platform,
                error: err.message
            });
        });
    }

    /**
     * Handle failed operation
     */
    onFailure(error) {
        this.metrics.totalFailures++;
        this.failureCount++;
        this.lastFailureTime = Date.now();

        // Add to sliding window
        this.failureTimestamps.push(Date.now());
        this.cleanupOldFailures();

        // Check failure rate in sliding window
        const failureRate = this.getFailureRate();

        logger.warn('Circuit breaker failure', {
            platform: this.platform,
            state: this.state,
            failureCount: this.failureCount,
            failureRate,
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode
            }
        });

        if (this.state === 'HALF_OPEN') {
            // Failure in HALF_OPEN state - immediately open
            this.transitionTo('OPEN');
            logger.error('Circuit breaker test failed, reopening', {
                platform: this.platform,
                error: error.message
            });

        } else if (this.state === 'CLOSED') {
            // Check if we should open the circuit
            if (this.failureCount >= this.config.failureThreshold ||
                failureRate > 0.5) { // More than 50% failure rate
                this.transitionTo('OPEN');
                logger.error('Circuit breaker opened due to failures', {
                    platform: this.platform,
                    failureCount: this.failureCount,
                    threshold: this.config.failureThreshold,
                    failureRate
                });

                // Send alert
                this.sendAlert('opened', error);
            }
        }

        // Persist to Redis (async, non-blocking)
        this.saveToRedis().catch(err => {
            logger.warn('Failed to save circuit breaker state after failure', {
                platform: this.platform,
                error: err.message
            });
        });
    }

    /**
     * Transition to a new state
     */
    transitionTo(newState) {
        const oldState = this.state;
        this.state = newState;
        this.lastStateChange = Date.now();

        // Reset counters
        this.failureCount = 0;
        this.successCount = 0;

        // Track metrics
        this.metrics.stateChanges.push({
            from: oldState,
            to: newState,
            timestamp: Date.now()
        });

        if (newState === 'OPEN') {
            this.metrics.lastOpenedAt = Date.now();
        } else if (newState === 'CLOSED') {
            this.metrics.lastClosedAt = Date.now();
            if (this.metrics.lastOpenedAt) {
                this.metrics.totalTimeOpen += Date.now() - this.metrics.lastOpenedAt;
            }
        }

        logger.info('Circuit breaker state transition', {
            platform: this.platform,
            from: oldState,
            to: newState,
            requestCount: this.requestCount
        });

        // Persist state change to Redis immediately (sync for critical state changes)
        this.saveToRedis().catch(err => {
            logger.error('Failed to save circuit breaker state after transition', {
                platform: this.platform,
                from: oldState,
                to: newState,
                error: err.message
            });
        });
    }

    /**
     * Check if we should attempt to reset (transition to HALF_OPEN)
     */
    shouldAttemptReset() {
        if (!this.lastFailureTime) return false;

        const timeSinceLastFailure = Date.now() - this.lastFailureTime;
        return timeSinceLastFailure >= this.config.timeout;
    }

    /**
     * Get time until circuit reset attempt
     */
    getTimeUntilReset() {
        if (!this.lastFailureTime) return 0;

        const elapsed = Date.now() - this.lastFailureTime;
        const remaining = this.config.timeout - elapsed;
        return Math.max(0, remaining);
    }

    /**
     * Get current state (with automatic transitions)
     */
    getState() {
        // Check for automatic state transitions
        if (this.state === 'OPEN' && this.shouldAttemptReset()) {
            // Don't automatically transition here, let execute() handle it
            // This is just for external state queries
        }

        return this.state;
    }

    /**
     * Get failure rate in sliding window
     */
    getFailureRate() {
        this.cleanupOldFailures();

        if (this.failureTimestamps.length === 0) return 0;

        // Calculate failure rate as failures per minute
        const windowSize = Math.min(Date.now() - this.failureTimestamps[0], this.config.windowSize);
        const rate = this.failureTimestamps.length / (windowSize / 60000);

        return rate;
    }

    /**
     * Clean up old failures outside sliding window
     */
    cleanupOldFailures() {
        const cutoff = Date.now() - this.config.windowSize;
        this.failureTimestamps = this.failureTimestamps.filter(ts => ts > cutoff);
    }

    /**
     * Manually reset circuit breaker
     */
    reset() {
        const oldState = this.state;
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.lastStateChange = Date.now();
        this.failureTimestamps = [];

        logger.info('Circuit breaker manually reset', {
            platform: this.platform,
            from: oldState,
            to: 'CLOSED'
        });

        this.sendAlert('reset', { manual: true });

        // Persist reset to Redis
        this.saveToRedis().catch(err => {
            logger.error('Failed to save circuit breaker state after reset', {
                platform: this.platform,
                error: err.message
            });
        });
    }

    /**
     * Get circuit breaker status
     */
    getStatus() {
        return {
            platform: this.platform,
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
            lastStateChange: this.lastStateChange,
            failureRate: this.getFailureRate(),
            timeUntilReset: this.getTimeUntilReset(),
            config: this.config,
            metrics: {
                ...this.metrics,
                uptime: this.getUptime()
            }
        };
    }

    /**
     * Get uptime percentage
     */
    getUptime() {
        const totalTime = Date.now() - (this.metrics.stateChanges[0]?.timestamp || Date.now());
        if (totalTime === 0) return 100;

        const closedTime = totalTime - this.metrics.totalTimeOpen;
        return (closedTime / totalTime) * 100;
    }

    /**
     * Send alert for state changes
     */
    async sendAlert(event, details = {}) {
        // TODO: Implement actual alerting (email, SMS, Slack, etc.)
        logger.info('Circuit breaker alert', {
            platform: this.platform,
            event,
            state: this.state,
            details
        });
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };

        logger.info('Circuit breaker config updated', {
            platform: this.platform,
            config: this.config
        });
    }
}

/**
 * CircuitBreakerService
 * Manages circuit breakers for all platforms
 */
class CircuitBreakerService {
    constructor() {
        this.circuitBreakers = new Map();
        this.initialized = false;
    }

    /**
     * Initialize service
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Load configurations for all platforms
            const configs = await CourierIntegrationConfigModel.find({ enabled: true });

            for (const config of configs) {
                if (config.circuitBreaker?.enabled) {
                    this.createCircuitBreaker(config.platform, config.circuitBreaker);
                }
            }

            // Start monitoring
            this.startMonitoring();

            this.initialized = true;
            logger.info('CircuitBreakerService initialized', {
                platforms: Array.from(this.circuitBreakers.keys())
            });
        } catch (error) {
            logger.error('Failed to initialize CircuitBreakerService', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get or create circuit breaker for a platform
     */
    getCircuitBreaker(platform) {
        if (!this.circuitBreakers.has(platform)) {
            this.createCircuitBreaker(platform);
        }
        return this.circuitBreakers.get(platform);
    }

    /**
     * Create circuit breaker for a platform
     */
    createCircuitBreaker(platform, config = {}) {
        const circuitBreaker = new CircuitBreaker(platform, config);
        this.circuitBreakers.set(platform, circuitBreaker);
        return circuitBreaker;
    }

    /**
     * Execute operation with circuit breaker protection
     */
    async execute(platform, operation, context = {}) {
        const circuitBreaker = this.getCircuitBreaker(platform);
        return await circuitBreaker.execute(operation, context);
    }

    /**
     * Reset circuit breaker for a platform
     */
    reset(platform) {
        const circuitBreaker = this.circuitBreakers.get(platform);
        if (circuitBreaker) {
            circuitBreaker.reset();
        }
    }

    /**
     * Get status of all circuit breakers
     */
    getAllStatus() {
        const status = {};
        for (const [platform, breaker] of this.circuitBreakers.entries()) {
            status[platform] = breaker.getStatus();
        }
        return status;
    }

    /**
     * Get status of a specific circuit breaker
     */
    getStatus(platform) {
        const circuitBreaker = this.circuitBreakers.get(platform);
        return circuitBreaker ? circuitBreaker.getStatus() : null;
    }

    /**
     * Update configuration for a platform
     */
    async updateConfig(platform, newConfig) {
        const circuitBreaker = this.circuitBreakers.get(platform);
        if (circuitBreaker) {
            circuitBreaker.updateConfig(newConfig);
        } else {
            this.createCircuitBreaker(platform, newConfig);
        }

        // Save to database
        await CourierIntegrationConfigModel.findOneAndUpdate(
            { platform },
            { circuitBreaker: newConfig },
            { upsert: true }
        );
    }

    /**
     * Start monitoring circuit breakers
     */
    startMonitoring() {
        // Monitor every 30 seconds
        setInterval(() => {
            for (const [platform, breaker] of this.circuitBreakers.entries()) {
                const status = breaker.getStatus();

                // Alert if circuit has been open for too long
                if (status.state === 'OPEN' && status.timeUntilReset === 0) {
                    logger.warn('Circuit breaker stuck open', {
                        platform,
                        duration: Date.now() - status.lastStateChange
                    });
                }

                // Log metrics
                if (status.metrics.totalRequests > 0) {
                    logger.debug('Circuit breaker metrics', {
                        platform,
                        ...status.metrics
                    });
                }
            }
        }, 30000); // Every 30 seconds
    }
}

// Export singleton instance
const circuitBreakerService = new CircuitBreakerService();
export default circuitBreakerService;

// Also export CircuitBreaker class for testing
export { CircuitBreaker };