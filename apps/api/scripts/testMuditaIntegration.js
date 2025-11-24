#!/usr/bin/env node

/**
 * MuditaKurye Integration Test Script
 * Hızlı integration test için kullanın
 *
 * Usage: node scripts/testMuditaIntegration.js
 */

import axios from 'axios';
import 'dotenv/config';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@tulumbak.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let authToken = null;

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, colors.green);
}

function error(message) {
    log(`❌ ${message}`, colors.red);
}

function info(message) {
    log(`ℹ️  ${message}`, colors.cyan);
}

function warn(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

async function login() {
    try {
        info('Logging in as admin...');
        const response = await axios.post(`${BACKEND_URL}/api/admin/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (response.data.success && response.data.token) {
            authToken = response.data.token;
            success('Admin login successful');
            return true;
        } else {
            error('Login failed: No token received');
            return false;
        }
    } catch (err) {
        error(`Login failed: ${err.message}`);
        if (err.response) {
            error(`Response: ${JSON.stringify(err.response.data)}`);
        }
        return false;
    }
}

async function testDashboard() {
    try {
        info('Testing dashboard endpoint...');
        const response = await axios.get(
            `${BACKEND_URL}/api/admin/courier-integration/dashboard`,
            { headers: { token: authToken } }
        );

        if (response.data.success) {
            success('Dashboard loaded successfully');
            info(`Platform: ${response.data.data.platform}`);
            info(`Enabled: ${response.data.data.config.enabled}`);
            info(`Test Mode: ${response.data.data.config.testMode}`);
            return true;
        }
    } catch (err) {
        error(`Dashboard test failed: ${err.message}`);
        return false;
    }
}

async function testGetConfig() {
    try {
        info('Testing get configuration...');
        const response = await axios.get(
            `${BACKEND_URL}/api/admin/courier-integration/configs/muditakurye`,
            { headers: { token: authToken } }
        );

        if (response.data.success) {
            success('Configuration loaded');
            const config = response.data.config;
            info(`API URL: ${config.apiUrl}`);
            info(`Restaurant ID: ${config.restaurantId}`);
            info(`Has API Key: ${config.apiKey ? 'Yes' : 'No'}`);
            info(`Has Webhook Secret: ${config.hasWebhookSecret ? 'Yes' : 'No'}`);
            return true;
        }
    } catch (err) {
        if (err.response?.status === 404) {
            warn('Configuration not found - will create one');
            return await testCreateConfig();
        }
        error(`Get config failed: ${err.message}`);
        return false;
    }
}

async function testCreateConfig() {
    try {
        info('Creating test configuration...');
        const configData = {
            platform: 'muditakurye',
            enabled: true,
            testMode: true,
            apiUrl: process.env.MUDITAKURYE_BASE_URL || 'https://api.muditakurye.com.tr',
            apiKey: process.env.MUDITAKURYE_API_KEY || 'yk_test_key',
            restaurantId: process.env.MUDITAKURYE_RESTAURANT_ID || 'rest_test',
            webhookSecret: process.env.MUDITA_WEBHOOK_SECRET || 'wh_test_secret',
            webhookOnlyMode: false
        };

        const response = await axios.put(
            `${BACKEND_URL}/api/admin/courier-integration/configs/muditakurye`,
            configData,
            { headers: { token: authToken } }
        );

        if (response.data.success) {
            success('Configuration created successfully');
            return true;
        }
    } catch (err) {
        error(`Create config failed: ${err.message}`);
        if (err.response) {
            error(`Response: ${JSON.stringify(err.response.data)}`);
        }
        return false;
    }
}

async function testValidation() {
    try {
        info('Testing configuration validation...');
        const response = await axios.post(
            `${BACKEND_URL}/api/admin/courier-integration/validate/muditakurye`,
            {},
            { headers: { token: authToken } }
        );

        if (response.data.success) {
            const validation = response.data.validation;

            if (validation.valid) {
                success('Configuration is valid');
            } else {
                warn('Configuration has issues');
            }

            if (validation.errors?.length > 0) {
                error('Validation Errors:');
                validation.errors.forEach(err => error(`  - ${err}`));
            }

            if (validation.warnings?.length > 0) {
                warn('Validation Warnings:');
                validation.warnings.forEach(warning => warn(`  - ${warning}`));
            }

            return validation.valid;
        }
    } catch (err) {
        error(`Validation test failed: ${err.message}`);
        return false;
    }
}

async function testHealth() {
    try {
        info('Testing health check...');
        const response = await axios.get(
            `${BACKEND_URL}/api/admin/courier-integration/health/muditakurye`,
            { headers: { token: authToken } }
        );

        const health = response.data.health;

        if (health.status === 'healthy') {
            success('Integration is healthy');
        } else if (health.status === 'degraded') {
            warn('Integration is degraded');
        } else {
            error('Integration is unhealthy');
        }

        info('Health Checks:');
        health.checks.forEach(check => {
            const symbol = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
            log(`  ${symbol} ${check.name}: ${check.message}`);
        });

        return health.status !== 'unhealthy';
    } catch (err) {
        error(`Health check failed: ${err.message}`);
        return false;
    }
}

async function runTests() {
    log('\n' + '='.repeat(60), colors.blue);
    log('MuditaKurye Integration Test Suite', colors.blue);
    log('='.repeat(60) + '\n', colors.blue);

    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };

    // Test 1: Login
    results.total++;
    if (await login()) {
        results.passed++;
    } else {
        results.failed++;
        error('Cannot proceed without authentication');
        return results;
    }

    log('');

    // Test 2: Dashboard
    results.total++;
    if (await testDashboard()) {
        results.passed++;
    } else {
        results.failed++;
    }

    log('');

    // Test 3: Get/Create Config
    results.total++;
    if (await testGetConfig()) {
        results.passed++;
    } else {
        results.failed++;
    }

    log('');

    // Test 4: Validation
    results.total++;
    if (await testValidation()) {
        results.passed++;
    } else {
        results.failed++;
    }

    log('');

    // Test 5: Health Check
    results.total++;
    if (await testHealth()) {
        results.passed++;
    } else {
        results.failed++;
    }

    log('');
    log('='.repeat(60), colors.blue);
    log('Test Results:', colors.blue);
    log('='.repeat(60), colors.blue);
    log(`Total Tests: ${results.total}`);
    success(`Passed: ${results.passed}`);
    error(`Failed: ${results.failed}`);

    if (results.failed === 0) {
        log('\n🎉 All tests passed! Integration is working correctly.', colors.green);
    } else {
        log('\n❌ Some tests failed. Please check the errors above.', colors.red);
    }

    return results;
}

// Run tests
runTests()
    .then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(err => {
        error(`Fatal error: ${err.message}`);
        console.error(err);
        process.exit(1);
    });
