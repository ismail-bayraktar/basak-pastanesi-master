import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import "dotenv/config"
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import { connectRedis } from "./config/redis.js";
import path, { dirname } from "path";
import userRouter from "./routes/UserRoute.js";
import productRouter from "./routes/ProductRoute.js";
import categoryRouter from "./routes/CategoryRoute.js";
import cartRouter from "./routes/CartRoute.js";
import orderRouter from "./routes/OrderRoute.js";
import ejsLayouts from 'express-ejs-layouts';
import { fileURLToPath } from 'url';
import paytrRouter from "./routes/PayTrRoute.js";
import sliderRouter from "./routes/SliderRoute.js";
import deliveryRouter from "./routes/DeliveryRoute.js";
import courierRouter from "./routes/CourierRoute.js";
import couponRouter from "./routes/CouponRoute.js";
import corporateRouter from "./routes/CorporateRoute.js";
import settingsRouter from "./routes/SettingsRoute.js";
import reportRouter from "./routes/ReportRoute.js";
import adminRouter from "./routes/AdminRoute.js";
import enhancedMediaRouter from "./routes/EnhancedMediaRoute.js";
import courierManagementRouter from "./routes/CourierManagementRoute.js";
import branchRouter from "./routes/BranchRoute.js";
import webhookConfigRouter from "./routes/WebhookConfigRoute.js";
import webhookRouter from "./routes/WebhookRoute.js";
import courierIntegrationRouter from "./routes/CourierIntegrationRoute.js";
import deadLetterQueueRouter from "./routes/DeadLetterQueueRoute.js";
import cacheManagementRouter from "./routes/CacheManagementRoute.js";
import outgoingWebhookRouter from "./routes/OutgoingWebhookRoute.js";
import emailRouter from "./routes/emailRoute.js";
import notificationRouter from "./routes/NotificationRoute.js";
import reviewRouter from "./routes/ReviewRoute.js";
import RateLimiterService from "./services/RateLimiter.js";
import OutgoingWebhookService from "./services/OutgoingWebhookService.js";
import logger, { logInfo } from "./utils/logger.js";
import { initSentry } from "./utils/sentry.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { swaggerDocs } from "./config/swagger.js";
import { maintenanceMode } from "./middleware/MaintenanceMode.js";
import { existsSync, mkdirSync } from 'fs';

// APP CONFIG
const app = express();

// Manually register packages for Vercel environment to ensure they are bundled
// This is a workaround for Vercel's monorepo dependency resolution issue
if (process.env.VERCEL) {
    try {
        // Explicitly reference critical packages
        const _mongoose = await import('mongoose');
        const _express = await import('express');
        const _cors = await import('cors');
        const _helmet = await import('helmet');
        const _dotenv = await import('dotenv');
    } catch (e) {
        // Just for bundling, ignore runtime errors
    }
}

// Initialize Sentry (before other middleware)
initSentry();

// Create logs directory (with serverless-safe error handling)
try {
    if (!existsSync('./logs')) {
        mkdirSync('./logs');
    }
} catch (error) {
    // In serverless environments (Vercel), file system writes may be restricted
    // Log to console instead - logs will be captured by Vercel
    console.warn('Unable to create logs directory (serverless environment):', error.message);
}

logInfo('Initializing Basak Pastanesi Backend App', {
    environment: process.env.NODE_ENV || 'development'
});

// Connect to services
connectDB();
connectCloudinary();
connectRedis();

// Background jobs and services initialization
// SKIPPED IN VERCEL ENVIRONMENT to prevent function timeouts and high credit usage
if (!process.env.VERCEL) {
    // Initialize default settings on startup (dynamic import to avoid circular dependency)
    setTimeout(async () => {
        try {
            const { initDefaultSettings } = await import("./controllers/SettingsController.js");
            await initDefaultSettings();

            // Initialize media settings
            const { initializeSettings } = await import("./utils/initializeSettings.js");
            await initializeSettings();
            logger.info("Media settings initialized successfully");
        } catch (error) {
            logger.error("Error initializing settings", { error: error.message, stack: error.stack });
        }
    }, 2000);

    // Initialize OutgoingWebhookService
    setTimeout(async () => {
        try {
            await OutgoingWebhookService.initialize();
            logger.info("OutgoingWebhookService initialized successfully");
        } catch (error) {
            logger.error("Error initializing OutgoingWebhookService", { error: error.message, stack: error.stack });
        }
    }, 3000);

    // Initialize CourierIntegrationService
    setTimeout(async () => {
        try {
            const { default: CourierIntegrationService } = await import("./services/CourierIntegrationService.js");
            await CourierIntegrationService.initialize();
            logger.info("CourierIntegrationService initialized successfully");
        } catch (error) {
            logger.error("Error initializing CourierIntegrationService", { error: error.message, stack: error.stack });
        }
    }, 4000);

    // Initialize Product Cleanup Job (30-day auto-delete for soft deleted products)
    setTimeout(async () => {
        try {
            const { cleanupJob } = await import("./jobs/cleanupDeletedProducts.js");
            cleanupJob.start();
            logger.info("Product cleanup job scheduled successfully (daily at 3:00 AM)");
        } catch (error) {
            logger.error("Error initializing product cleanup job", { error: error.message, stack: error.stack });
        }
    }, 5000);
} else {
    logger.info('Background jobs and delayed initializations skipped in Vercel environment');
}

// PAYTR
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const viewsPath = path.join(__dirname, '/app_server/views');
logger.debug("Views path configured", { viewsPath });

app.set('views', path.join(__dirname, '/app_server/views'));
app.use(express.urlencoded({ extended: true }));
app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(ejsLayouts);


// MIDDLEWARES
// CSP allowed image sources from environment or defaults
const cspImageSources = process.env.CSP_IMAGE_SOURCES
    ? process.env.CSP_IMAGE_SOURCES.split(',').map(src => src.trim())
    : ["'self'", "data:", "http://localhost:4001", "http://localhost:5176"];

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            imgSrc: cspImageSources,
            objectSrc: ["'none'"],
            scriptSrc: ["'self'"],
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'", "https:", "'unsafe-inline'"],
            upgradeInsecureRequests: []
        }
    }
})); // Security headers

// Trust proxy for Vercel/production environments (required for rate limiting and client IP detection)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    app.set('trust proxy', 1); // Trust only the first proxy (Vercel/Cloud load balancer)
}

app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:4001'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            logger.warn('CORS blocked origin', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token', 'X-Requested-With']
}));

// Rate limiting
const shouldUseRateLimiter = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;

if (shouldUseRateLimiter) {
    const generalLimiter = RateLimiterService.createGeneralLimiter(100, 15 * 60 * 1000);
    app.use('/api', (req, res, next) => {
        // Exempt SSE endpoints from rate limiting (long-running connections)
        if (req.path.startsWith('/notifications/stream')) {
            logger.debug('SSE endpoint exempted from rate limiting', { path: req.path });
            return next();
        }
        // Exempt slider list endpoint (public, frequently accessed, cached on frontend)
        if (req.path === '/api/slider/list' && req.method === 'GET') {
            logger.debug('Slider list endpoint exempted from rate limiting', { path: req.path });
            return next();
        }
        // Apply rate limiting to all other endpoints
        return generalLimiter(req, res, next);
    });
    logger.info('Rate limiting enabled (development mode)');
} else {
    logger.warn('⚠️ Rate limiting DISABLED in production/Vercel (trust proxy issue - implement user-based rate limiting)');
}

// Maintenance mode middleware - blocks all requests when enabled (except admin routes)
app.use(maintenanceMode);

// Static files for uploads with enhanced CORS
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// Static files for assets (frontend/public/assets) with enhanced CORS
app.use('/assets', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../frontend/public/assets')));

// Alternative 2: Image proxy endpoint (ACTIVE SOLUTION)
app.get('/api/image-proxy/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, 'uploads', filename);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Send image
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).json({ error: 'Image not found' });
        }
    });
});

// API ENDPOINTS
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/category', categoryRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/paytr', paytrRouter);
app.use('/api/slider', sliderRouter);
app.use('/api/media-enhanced', enhancedMediaRouter);
app.use('/api/courier', courierRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/corporate', corporateRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/report', reportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/cache', cacheManagementRouter); // Cache management admin panel
app.use('/api/admin/webhooks', outgoingWebhookRouter); // Outgoing webhook management
app.use('/api/courier-management', courierManagementRouter);
app.use('/api/branches', branchRouter);
app.use('/api/webhook-config', webhookConfigRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/admin/courier-integration', courierIntegrationRouter);
app.use('/api/dlq', deadLetterQueueRouter);
app.use('/api/email', emailRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reviews', reviewRouter);

// Swagger Documentation
swaggerDocs(app);
app.get('/paytr/payment', (req, res) => {
    const token = req.query.token;
    res.render('layout', { iframetoken: token });
});
app.get('/', (req, res) => {
    res.send("API Working")
})

// Error handlers must be last
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
// CORS configured for production domains
