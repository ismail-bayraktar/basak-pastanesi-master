import ProductService from "../services/ProductService.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { productSchema } from "../schemas/productSchema.js";
import logger from "../utils/logger.js";

const addProduct = async (req, res) => {
    try {
        const validation = productSchema.safeParse(req.body);

        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const product = await ProductService.addProduct(validation.data, req.files);
        logger.info('Product added successfully', { productId: product._id, name: validation.data.name });
        successResponse(res, product, "Product added successfully");
    } catch (error) {
        logger.error('Error adding product', { error: error.message, stack: error.stack });
        errorResponse(res, error.message);
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return errorResponse(res, "Product id is required", 400);
        }

        const validation = productSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const product = await ProductService.updateProduct(id, validation.data, req.files);
        logger.info('Product updated successfully', { productId: id });
        successResponse(res, product, "Product updated successfully");
    } catch (error) {
        logger.error('Error updating product', { error: error.message, stack: error.stack });
        errorResponse(res, error.message, error.message === "Product not found" ? 404 : 500);
    }
}

const listProducts = async (req, res) => {
    try {
        const products = await ProductService.listProducts(req.query);
        successResponse(res, { products });
    } catch (error) {
        logger.error('Error listing products', { error: error.message, stack: error.stack });
        errorResponse(res, error.message);
    }
}

const removeProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await ProductService.removeProduct(id);
        logger.info('Product removed successfully', { productId: id });
        successResponse(res, null, "Product removed successfully");
    } catch (error) {
        logger.error('Error removing product', { error: error.message, stack: error.stack });
        errorResponse(res, error.message);
    }
}

const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await ProductService.getProductById(productId);
        successResponse(res, { product });
    } catch (error) {
        logger.error('Error fetching single product', { error: error.message, stack: error.stack });
        errorResponse(res, error.message, error.message === "Product not found" ? 404 : 500);
    }
}

const getProductBySKU = async (req, res) => {
    try {
        const { sku } = req.params;
        const product = await ProductService.getProductBySku(sku);
        successResponse(res, { product });
    } catch (error) {
        logger.error('Error fetching product by SKU', { error: error.message });
        errorResponse(res, error.message, 404);
    }
}

const getProductByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;
        const product = await ProductService.getProductByBarcode(barcode);
        successResponse(res, { product });
    } catch (error) {
        logger.error('Error fetching product by barcode', { error: error.message });
        errorResponse(res, error.message, 404);
    }
}

const softDeleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const adminId = req.userId || 'system';
        await ProductService.softDeleteProduct(id, adminId);
        logger.info('Product soft deleted', { productId: id });
        successResponse(res, null, "Ürün pasife alındı");
    } catch (error) {
        logger.error('Error soft deleting product', { error: error.message });
        errorResponse(res, error.message);
    }
};

const restoreProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await ProductService.restoreProduct(id);
        logger.info('Product restored', { productId: id });
        successResponse(res, null, "Ürün geri yüklendi");
    } catch (error) {
        logger.error('Error restoring product', { error: error.message });
        errorResponse(res, error.message);
    }
};

const permanentDeleteProduct = async (req, res) => {
    try {
        const { id } = req.body;
        await ProductService.permanentDeleteProduct(id);
        logger.info('Product permanently deleted', { productId: id });
        successResponse(res, null, "Ürün kalıcı olarak silindi");
    } catch (error) {
        logger.error('Error permanently deleting product', { error: error.message });
        errorResponse(res, error.message);
    }
};

const quickUpdateProduct = async (req, res) => {
    try {
        const { id, field, value } = req.body;
        if (!id || !field) {
            return errorResponse(res, "ID ve alan adı gereklidir", 400);
        }

        const product = await ProductService.quickUpdateProduct(id, field, value);
        successResponse(res, { product }, "Ürün güncellendi");
    } catch (error) {
        logger.error('Error quick updating product', { error: error.message });
        errorResponse(res, error.message);
    }
};

const getPriceRange = async (req, res) => {
    try {
        const { minPrice, maxPrice } = await ProductService.getPriceRange();
        successResponse(res, { minPrice, maxPrice });
    } catch (error) {
        logger.error('Error getting price range', { error: error.message });
        errorResponse(res, error.message);
    }
};

export {
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
};
