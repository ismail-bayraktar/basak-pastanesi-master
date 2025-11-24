import productModel from "../models/ProductModel.js";
import settingsModel from "../models/SettingsModel.js";
import logger from "../utils/logger.js";

/**
 * Check cart items stock availability before placing order
 */
export const checkStockAvailability = async (req, res, next) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: 'Sepet boş veya geçersiz' });
        }

        for (const item of items) {
            // Hem item.id hem de item._id'yi kontrol et (frontend farklı formatlar gönderebilir)
            const productId = item.id || item._id;
            if (!productId) {
                return res.json({ success: false, message: 'Ürün ID\'si bulunamadı' });
            }
            
            const product = await productModel.findById(productId);
            if (!product) {
                return res.json({ success: false, message: 'Ürün bulunamadı' });
            }
            const requested = Number(item.quantity || 0);
            if (Number(product.stock || 0) < requested) {
                return res.json({ success: false, message: `${product.name} için stok yetersiz` });
            }
        }

        next();
    } catch (error) {
        logger.error('Error checking stock availability', { error: error.message, stack: error.stack, items: req.body.items });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Reduce stock quantities for ordered items
 */
export const reduceStock = async (items) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
        const requested = Number(item.quantity || 0);
        // Hem item.id hem de item._id'yi kontrol et
        const productId = item.id || item._id;
        if (!productId || !requested) continue;
        await productModel.findByIdAndUpdate(
            productId,
            { $inc: { stock: -requested } },
            { new: true }
        );
    }
};

/**
 * Warn when stock goes below threshold (settings-based)
 */
export const checkLowStockAlert = async (productId) => {
    try {
        const product = await productModel.findById(productId);
        if (!product) return;

        const enableSetting = await settingsModel.findOne({ key: 'stock_enable_alerts' });
        const thresholdSetting = await settingsModel.findOne({ key: 'stock_min_threshold' });

        const alertsEnabled = enableSetting?.value !== undefined ? !!enableSetting.value : true;
        const threshold = typeof thresholdSetting?.value === 'number' ? thresholdSetting.value : 10;

        if (!alertsEnabled) return;

        if (Number(product.stock || 0) <= threshold) {
            // In future: integrate with EmailService/Slack, create notification record, etc.
            logger.warn('Low stock alert', { 
                productId: product._id, 
                productName: product.name, 
                stock: product.stock, 
                threshold 
            });
        }
    } catch (error) {
        logger.error('Low stock check error', { error: error.message, stack: error.stack, productId });
    }
};

export default { checkStockAvailability, reduceStock, checkLowStockAlert };

