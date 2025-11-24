import express from 'express';
import {
    listProducts,
    addProduct,
    removeProduct,
    singleProduct,
    updateProduct,
    softDeleteProduct,
    restoreProduct,
    permanentDeleteProduct,
    quickUpdateProduct,
    getProductBySKU,
    getProductByBarcode,
    getPriceRange
} from '../controllers/ProductController.js';
import adminAuth from "../middleware/AdminAuth.js";
import RateLimiterService from "../services/RateLimiter.js";
import { cache, invalidateCache } from "../middleware/cache.js";

const productRouter = express.Router();

/**
 * @swagger
 * /api/product/list:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: inStockOnly
 *         schema:
 *           type: boolean
 *         description: Show only in-stock products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 productData:
 *                   type: array
 */

import upload from '../middleware/multer.js';

// Admin routes with rate limiting
// Note: Image upload now handled via Cloudinary direct upload from frontend
// Product add/update expects image URLs in request body instead of file uploads
// Helper to handle multer errors
const uploadMiddleware = (req, res, next) => {
    const uploadFields = upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 }
    ]);

    uploadFields(req, res, (err) => {
        if (err) {
            // If error is MulterError: Unexpected field, it means the user sent a field not in the list
            // We can ignore it or return a better error.
            // For "Optional File Upload" requirement, if no files are sent but content-type is multipart, it should be fine.
            // But if they send "image" instead of "image1", it throws.
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                // Log warning but proceed without files if possible?
                // No, multer consumes the stream. If we ignore, we might lose body.
                // Better to return a clear error.
                return res.status(400).json({ success: false, message: `Dosya yükleme hatası: ${err.message}. Lütfen 'image1', 'image2', 'image3', 'image4' alanlarını kullanın.` });
            }
            return res.status(400).json({ success: false, message: `Dosya yükleme hatası: ${err.message}` });
        }
        next();
    });
};

productRouter.post('/add', adminAuth, RateLimiterService.createUploadLimiter(), uploadMiddleware, addProduct);
productRouter.post('/update', adminAuth, RateLimiterService.createUploadLimiter(), uploadMiddleware, updateProduct);
productRouter.post('/remove', adminAuth, removeProduct);

// Soft delete and restore routes
productRouter.post('/soft-delete', adminAuth, softDeleteProduct);
productRouter.post('/restore', adminAuth, restoreProduct);
productRouter.post('/permanent-delete', adminAuth, permanentDeleteProduct);

// Quick update route for inline editing
productRouter.post('/quick-update', adminAuth, quickUpdateProduct);

/**
 * @swagger
 * /api/product/list:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of products
 */
productRouter.get('/list', cache(300), listProducts);

/**
 * @swagger
 * /api/product/single:
 *   post:
 *     summary: Get single product details
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product details
 */
productRouter.post('/single', cache(300), singleProduct);

/**
 * @swagger
 * /api/product/sku/{sku}:
 *   get:
 *     summary: Get product by SKU
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: Product SKU (e.g., TUL-250-001)
 *     responses:
 *       200:
 *         description: Product details
 */
productRouter.get('/sku/:sku', cache(300), getProductBySKU);

/**
 * @swagger
 * /api/product/barcode/{barcode}:
 *   get:
 *     summary: Get product by barcode
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Product barcode/GTIN
 *     responses:
 *       200:
 *         description: Product details
 */
productRouter.get('/barcode/:barcode', cache(300), getProductByBarcode);

/**
 * @swagger
 * /api/product/price-range:
 *   get:
 *     summary: Get min and max product prices for filter slider
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Price range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 minPrice:
 *                   type: number
 *                 maxPrice:
 *                   type: number
 */
productRouter.get('/price-range', cache(300), getPriceRange);

export default productRouter;
