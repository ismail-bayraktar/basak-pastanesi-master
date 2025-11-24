import axios from 'axios';
import crypto from 'crypto';
import CourierIntegrationConfigModel from '../models/CourierIntegrationConfigModel.js';
import DeadLetterQueueModel from '../models/DeadLetterQueueModel.js';
import WebhookSecurity from '../utils/webhookSecurity.js';
import logger from '../utils/logger.js';

/**
 * MuditaKurye Integration Service
 * Handles all interactions with MuditaKurye API
 * Implements authentication, order submission, and status tracking
 */

class MuditaKuryeService {
    constructor() {
        this.apiClient = null;
        this.config = null;
        this.authToken = null;
        this.tokenExpiresAt = null;
    }

    /**
     * Initialize service with configuration
     */
    async initialize() {
        try {
            // Load configuration from database
            this.config = await CourierIntegrationConfigModel.findOne({
                platform: 'muditakurye',
                enabled: true
            });

            if (!this.config) {
                // Fallback to environment variables for webhook-only mode
                const webhookOnlyMode = process.env.MUDITA_WEBHOOK_ONLY_MODE === 'true';
                const webhookSecret = process.env.MUDITA_WEBHOOK_SECRET;

                if (webhookOnlyMode && webhookSecret) {
                    logger.info('MuditaKurye running in webhook-only mode with environment config');
                    this.config = {
                        platform: 'muditakurye',
                        enabled: true,
                        testMode: process.env.MUDITA_TEST_MODE === 'true',
                        webhookSecret: webhookSecret,
                        apiUrl: process.env.MUDITA_API_URL || 'https://api.muditakurye.com.tr',
                        webhookOnlyMode: true,
                        credentials: {
                            apiKey: process.env.MUDITA_API_KEY || 'pending',
                            apiSecret: process.env.MUDITA_API_SECRET || 'pending',
                            webhookSecret: webhookSecret
                        }
                    };
                } else {
                    throw new Error('MuditaKurye configuration not found or disabled');
                }
            }

            // Set up axios client with defaults
            // Always use production URL from config or env (staging URL not available)
            const baseURL = this.config.apiUrl || process.env.MUDITAKURYE_BASE_URL || 'https://api.muditakurye.com.tr';

            this.apiClient = axios.create({
                baseURL,
                timeout: 30000, // 30 seconds
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'Tulumbak/1.0'
                }
            });

            // Add request interceptor for logging
            this.apiClient.interceptors.request.use(
                (config) => {
                    logger.info('MuditaKurye API Request', {
                        method: config.method,
                        url: config.url,
                        correlationId: config.headers['X-Correlation-ID']
                    });
                    return config;
                },
                (error) => {
                    logger.error('MuditaKurye API Request Error', {
                        error: error.message
                    });
                    return Promise.reject(error);
                }
            );

            // Add response interceptor for logging
            this.apiClient.interceptors.response.use(
                (response) => {
                    logger.info('MuditaKurye API Response', {
                        status: response.status,
                        url: response.config.url,
                        correlationId: response.config.headers['X-Correlation-ID']
                    });
                    return response;
                },
                (error) => {
                    const errorInfo = {
                        message: error.message,
                        status: error.response?.status,
                        url: error.config?.url,
                        correlationId: error.config?.headers?.['X-Correlation-ID'],
                        responseData: error.response?.data
                    };
                    logger.error('MuditaKurye API Response Error', errorInfo);
                    return Promise.reject(error);
                }
            );

            logger.info('MuditaKurye service initialized successfully');
            return true;
        } catch (error) {
            logger.error('Failed to initialize MuditaKurye service', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Authenticate with MuditaKurye API
     * Implements token caching with 10-minute TTL
     */
    async authenticate(force = false) {
        try {
            // Skip authentication in webhook-only mode
            if (this.config?.webhookOnlyMode) {
                logger.info('Running in webhook-only mode, skipping API authentication');
                return 'webhook-only-mode';
            }

            // Check if we have a valid cached token
            if (!force && this.authToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
                return this.authToken;
            }

            if (!this.config) {
                await this.initialize();
            }

            // Get decrypted credentials from config
            const apiKey = this.config.credentials?.apiKey || this.config.getDecryptedApiKey();
            const apiSecret = this.config.credentials?.apiSecret || this.config.getDecryptedApiSecret?.();

            // MuditaKurye uses API key in header, not OAuth token endpoint
            // So we'll set up the authentication header directly
            if (this.config.authType === 'api_key' || this.config.authType === 'bearer' || !this.config.authType) {
                this.authToken = apiKey;
                this.tokenExpiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

                // Set default auth header (MuditaKurye uses X-API-Key)
                this.apiClient.defaults.headers['X-API-Key'] = this.authToken;

                if (this.config.authType === 'bearer') {
                    this.apiClient.defaults.headers['Authorization'] = `Bearer ${this.authToken}`;
                }

                logger.info('MuditaKurye authentication successful', {
                    authType: this.config.authType || 'api_key',
                    apiKeyPrefix: apiKey?.substring(0, 10) + '...'
                });
                return this.authToken;
            }

            // Basic auth
            if (this.config.authType === 'basic') {
                const auth = Buffer.from(`${apiKey}:${apiSecret || ''}`).toString('base64');
                this.apiClient.defaults.headers['Authorization'] = `Basic ${auth}`;
                this.authToken = auth;
                this.tokenExpiresAt = Date.now() + (10 * 60 * 1000);
                return this.authToken;
            }

            throw new Error(`Unsupported auth type: ${this.config.authType}`);
        } catch (error) {
            logger.error('MuditaKurye authentication failed', {
                error: error.message,
                authType: this.config?.authType
            });
            throw error;
        }
    }

    /**
     * Transform Tulumbak order to MuditaKurye format
     */
    transformOrderData(tulumbakOrder) {
        // Handle multiple address formats
        // Format 1: address.address (nested field)
        // Format 2: address.street + address.city (separate fields)
        let deliveryAddress = tulumbakOrder.address?.address || '';

        // If no address.address, try building from street + city
        if (!deliveryAddress && tulumbakOrder.address) {
            const parts = [
                tulumbakOrder.address.street,
                tulumbakOrder.address.district,
                tulumbakOrder.address.city
            ].filter(Boolean);
            deliveryAddress = parts.join(', ');
        }

        const transformed = {
            orderId: tulumbakOrder._id.toString(),
            restaurantId: this.config.restaurantId || tulumbakOrder.muditaRestaurantId || process.env.MUDITA_RESTAURANT_ID,
            customerName: tulumbakOrder.address?.name || tulumbakOrder.address?.firstName || tulumbakOrder.address?.lastName || 'Müşteri',
            customerPhone: tulumbakOrder.address?.phone || tulumbakOrder.phone,
            customerEmail: tulumbakOrder.address?.email || null,
            deliveryAddress: deliveryAddress,
            deliveryLatitude: tulumbakOrder.address?.latitude || tulumbakOrder.address?.coordinates?.latitude || null,
            deliveryLongitude: tulumbakOrder.address?.longitude || tulumbakOrder.address?.coordinates?.longitude || null,

            // Payment information
            paymentMethod: this.mapPaymentMethod(tulumbakOrder.paymentMethod),
            paymentCaptured: tulumbakOrder.payment === true,

            // Amount details
            subtotal: tulumbakOrder.amount - (tulumbakOrder.delivery?.fee || 0) - (tulumbakOrder.codFee || 0),
            deliveryFee: tulumbakOrder.delivery?.fee || 0,
            serviceFee: tulumbakOrder.codFee || 0,
            discount: 0, // TODO: Add discount field if available
            taxAmount: 0, // TODO: Add tax calculation if needed
            total: tulumbakOrder.amount,
            currency: 'TRY',

            // Additional fields
            scheduledDeliveryTime: tulumbakOrder.scheduledDeliveryTime ?
                new Date(tulumbakOrder.scheduledDeliveryTime).toISOString() : null,
            notes: tulumbakOrder.giftNote || '',

            // Order items
            items: tulumbakOrder.items?.map((item, index) => ({
                productCode: item.productId || `ITEM-${index + 1}`,
                productName: item.name || 'Ürün',
                quantity: item.quantity || 1,
                unitPrice: item.price || 0,
                totalAmount: (item.quantity || 1) * (item.price || 0),
                discountAmount: 0,
                productNote: item.note || '',
                features: item.extras || ''
            })) || []
        };

        // Validate required fields
        if (!transformed.restaurantId) {
            throw new Error('Restaurant ID is required for MuditaKurye');
        }

        if (!transformed.deliveryAddress) {
            throw new Error('Delivery address is required');
        }

        return transformed;
    }

    /**
     * Map payment method to MuditaKurye format
     */
    mapPaymentMethod(paymentMethod) {
        const mapping = {
            'Cash On Delivery': 'CASH',
            'Kapıda Ödeme': 'CASH',
            'Credit Card': 'CARD_POS',
            'Online': 'ONLINE_PREPAID',
            'Transfer': 'ONLINE_PREPAID'
        };
        return mapping[paymentMethod] || 'CASH';
    }

    /**
     * Submit order to MuditaKurye
     */
    async createOrder(orderData) {
        const startTime = Date.now();
        const correlationId = `TLB-${orderData._id}-${Date.now()}`;

        try {
            // Check if we're in webhook-only mode
            if (this.config?.webhookOnlyMode) {
                logger.warn('Cannot create orders in webhook-only mode, API keys required', {
                    orderId: orderData._id,
                    correlationId
                });
                return {
                    success: false,
                    error: 'API anahtarları olmadan sipariş gönderilemez. Şu anda sadece webhook alabiliyoruz.',
                    code: 'WEBHOOK_ONLY_MODE',
                    retryable: false
                };
            }

            // Ensure authenticated
            const apiKey = await this.authenticate();

            // Transform order data
            const muditaOrder = this.transformOrderData(orderData);

            // Make API request with idempotency key
            const response = await this.apiClient.post(
                '/webhook/third-party/order',
                muditaOrder,
                {
                    headers: {
                        'X-API-Key': apiKey,
                        'X-Idempotency-Key': orderData._id.toString(),
                        'X-Correlation-ID': correlationId
                    }
                }
            );

            const duration = Date.now() - startTime;

            // Log success
            logger.info('MuditaKurye order created successfully', {
                orderId: orderData._id,
                muditaOrderId: response.data.orderId || response.data.muditaOrderId,
                status: response.data.status,
                duration,
                correlationId
            });

            return {
                success: true,
                externalOrderId: response.data.orderId || response.data.muditaOrderId,
                status: response.data.status || 'PENDING',
                duration,
                correlationId,
                response: response.data
            };

        } catch (error) {
            const duration = Date.now() - startTime;

            // Classify error
            const errorInfo = this.classifyError(error);

            logger.error('MuditaKurye order creation failed', {
                orderId: orderData._id,
                error: errorInfo,
                duration,
                correlationId
            });

            // Return error info for retry logic
            return {
                success: false,
                error: errorInfo,
                duration,
                correlationId,
                retryable: errorInfo.retryable
            };
        }
    }

    /**
     * Classify errors for retry logic
     */
    classifyError(error) {
        const errorInfo = {
            message: error.message,
            code: error.code,
            statusCode: error.response?.status,
            retryable: false,
            category: 'unknown'
        };

        // Network errors - retryable
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            errorInfo.retryable = true;
            errorInfo.category = 'network';
            return errorInfo;
        }

        // HTTP status based classification
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            errorInfo.message = data?.error || data?.message || error.message;
            errorInfo.code = data?.code || `HTTP_${status}`;

            switch (status) {
                case 400:
                    // Validation error - not retryable
                    errorInfo.category = 'validation';
                    errorInfo.retryable = false;
                    break;

                case 401:
                case 403:
                    // Auth error - retryable (might need token refresh)
                    errorInfo.category = 'authentication';
                    errorInfo.retryable = true;
                    break;

                case 404:
                    // Not found - not retryable
                    errorInfo.category = 'not_found';
                    errorInfo.retryable = false;
                    break;

                case 409:
                    // Conflict (duplicate) - not retryable
                    errorInfo.category = 'duplicate';
                    errorInfo.retryable = false;
                    break;

                case 429:
                    // Rate limit - retryable with backoff
                    errorInfo.category = 'rate_limit';
                    errorInfo.retryable = true;
                    errorInfo.retryAfter = parseInt(error.response.headers['retry-after']) || 60;
                    break;

                case 500:
                case 502:
                case 503:
                case 504:
                    // Server errors - retryable
                    errorInfo.category = 'server_error';
                    errorInfo.retryable = true;
                    break;

                default:
                    errorInfo.category = status >= 500 ? 'server_error' : 'client_error';
                    errorInfo.retryable = status >= 500;
            }
        }

        return errorInfo;
    }

    /**
     * Update order status (called from webhook)
     */
    async updateOrderStatus(externalOrderId, status, additionalData = {}) {
        try {
            // Map MuditaKurye status to Tulumbak status
            const statusMapping = this.config.statusMapping || new Map([
                ['VALIDATED', 'Siparişiniz Alındı'],
                ['ASSIGNED', 'Kuryeye Atandı'],
                ['PREPARED', 'Hazırlanıyor'],
                ['ON_DELIVERY', 'Yolda'],
                ['DELIVERED', 'Teslim Edildi'],
                ['CANCELED', 'İptal Edildi']
            ]);

            const tulumbakStatus = statusMapping.get(status) || status;

            return {
                success: true,
                tulumbakStatus,
                originalStatus: status,
                ...additionalData
            };
        } catch (error) {
            logger.error('Failed to update order status', {
                externalOrderId,
                status,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Cancel order
     *
     * ⚠️ IMPORTANT: MuditaKurye API does NOT provide a cancel order endpoint.
     * Cancellations must be done manually in the MuditaKurye panel.
     * When canceled, MuditaKurye sends a webhook to your cancel webhook URL.
     *
     * This function is kept for interface compatibility but will always return error.
     */
    async cancelOrder(externalOrderId, reason) {
        logger.warn('cancelOrder called but MuditaKurye API does not support order cancellation', {
            externalOrderId,
            reason,
            note: 'Cancellation must be done manually in MuditaKurye panel'
        });

        return {
            success: false,
            error: {
                code: 'NOT_SUPPORTED',
                message: 'MuditaKurye API does not support programmatic order cancellation. Please cancel the order manually in MuditaKurye panel. You will receive a webhook notification when the order is canceled.',
                category: 'configuration',
                retryable: false
            }
        };
    }

    /**
     * Get order status
     */
    async getOrderStatus(externalOrderId) {
        try {
            await this.authenticate();

            const response = await this.apiClient.get(`/api/orders/${externalOrderId}`);

            return {
                success: true,
                order: response.data
            };
        } catch (error) {
            const errorInfo = this.classifyError(error);
            logger.error('Failed to get order status', {
                externalOrderId,
                error: errorInfo
            });
            return {
                success: false,
                error: errorInfo
            };
        }
    }

    /**
     * Test connection to MuditaKurye API
     */
    async testConnection() {
        try {
            // In webhook-only mode, just verify configuration
            if (this.config?.webhookOnlyMode) {
                return {
                    success: true,
                    status: 'webhook-only',
                    message: 'Webhook-only mode aktif. Webhook secret key yapılandırıldı.',
                    webhookSecret: this.config.webhookSecret ? '✓ Configured' : '✗ Missing',
                    testMode: this.config.testMode,
                    timestamp: Date.now()
                };
            }

            await this.authenticate();

            // Try health check endpoint
            const response = await this.apiClient.get('/webhook/third-party/health');

            return {
                success: true,
                status: response.data.status || 'healthy',
                apiVersion: response.data.version,
                timestamp: response.data.timestamp || Date.now()
            };
        } catch (error) {
            const errorInfo = this.classifyError(error);
            return {
                success: false,
                error: errorInfo
            };
        }
    }

    /**
     * Verify webhook signature
     * Now uses WebhookSecurity utility (DRY principle)
     */
    verifyWebhookSignature(payload, signature, timestamp) {
        try {
            // Get secret key from config or env
            const secretKey = this.config?.webhookSecret ||
                              this.config?.credentials?.webhookSecret ||
                              process.env.MUDITA_WEBHOOK_SECRET;

            if (!secretKey) {
                logger.error('Webhook secret key not configured');
                return false;
            }

            // Use WebhookSecurity utility for verification
            return WebhookSecurity.verifySignature(
                payload,
                signature,
                timestamp,
                secretKey
            );
        } catch (error) {
            logger.error('Webhook signature verification error', {
                error: error.message
            });
            return false;
        }
    }
}

// Export singleton instance
export default new MuditaKuryeService();