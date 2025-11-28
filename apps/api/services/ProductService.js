import productModel from "../models/ProductModel.js";
import Media from "../models/MediaModel.js";
import logger from "../utils/logger.js";
import { deletePattern } from "../config/redis.js";
import MediaService from "../services/MediaService.js";

class ProductService {
    /**
     * Handle product images (upload new, use existing, or use direct URLs)
     */
    async handleProductImages(files, selectedMediaIds, directUrls = [], productName) {
        const imagesUrl = [];
        const mediaIds = [];

        // 1. Handle Direct URLs
        if (directUrls.length > 0) {
            imagesUrl.push(...directUrls.filter(url => url && url.trim()));
        }

        // 2. Handle New File Uploads
        const uploadedFiles = [
            files?.image1?.[0],
            files?.image2?.[0],
            files?.image3?.[0],
            files?.image4?.[0]
        ].filter(Boolean);

        if (uploadedFiles.length > 0) {
            try {
                const uploadResults = await Promise.all(
                    uploadedFiles.map(async (file, index) => {
                        const media = await MediaService.uploadMedia(file, {
                            folder: 'products',
                            category: 'product',
                            alt: `${productName} - Ürün görseli ${index + 1}`,
                            title: `${productName} - Görsel ${index + 1}`,
                            description: `${productName} ürünü için görsel`,
                            uploadedBy: 'admin'
                        });
                        mediaIds.push(media._id.toString());
                        return media.secureUrl || media.url;
                    })
                );
                imagesUrl.push(...uploadResults);
            } catch (error) {
                logger.error('Error uploading images', { error: error.message });
                throw new Error('Error uploading images: ' + error.message);
            }
        }

        // 3. Handle Selected Media from Library
        if (selectedMediaIds && selectedMediaIds.length > 0) {
            try {
                const selectedMedia = await Media.find({ _id: { $in: selectedMediaIds } });
                selectedMedia.forEach(media => {
                    imagesUrl.push(media.secureUrl || media.url);
                    mediaIds.push(media._id.toString());
                });
            } catch (error) {
                logger.error('Error selecting images from library', { error: error.message });
                throw new Error('Error selecting images: ' + error.message);
            }
        }

        return { imagesUrl, mediaIds };
    }

    /**
     * Add a new product
     */
    async addProduct(data, files) {
        const { imagesUrl, mediaIds } = await this.handleProductImages(
            files,
            data.selectedMediaIds,
            [],
            data.name
        );

        const productData = {
            ...data,
            category: typeof data.category === 'object' && data.category._id ? data.category._id : data.category,
            image: imagesUrl,
            date: Date.now(),
            labels: data.labels || [],
            keywords: data.keywords || []
        };

        const product = new productModel(productData);
        await product.save();

        // Update Media records
        if (mediaIds.length > 0) {
            Promise.all(mediaIds.map(mediaId =>
                Media.findByIdAndUpdate(mediaId, {
                    $set: {
                        'usedIn.0.id': product._id.toString(),
                        'usedIn.0.url': `/product/${product._id}`
                    }
                })
            )).catch(err => logger.error('Error updating media usage', { error: err.message }));
        }

        // Invalidate cache
        await deletePattern('/api/product/list*');
        await deletePattern('products:*');

        return await productModel.findById(product._id).populate('category', 'name slug active');
    }

    /**
     * Update a product
     */
    async updateProduct(id, data, files) {
        const directUrls = [data.imageUrl1, data.imageUrl2, data.imageUrl3, data.imageUrl4].filter(Boolean);

        const { imagesUrl, mediaIds } = await this.handleProductImages(
            files,
            data.selectedMediaIds,
            directUrls,
            data.name || 'Product'
        );

        const updatePayload = {
            ...data,
            category: typeof data.category === 'object' && data.category._id ? data.category._id : data.category,
        };

        if (imagesUrl.length > 0) {
            updatePayload.image = imagesUrl;
        }

        const product = await productModel.findByIdAndUpdate(id, updatePayload, { new: true });

        if (!product) {
            throw new Error("Product not found");
        }

        if (mediaIds.length > 0) {
            Promise.all(mediaIds.map(mediaId =>
                Media.findByIdAndUpdate(mediaId, {
                    $push: {
                        usedIn: {
                            type: 'product',
                            id: id,
                            url: `/product/${id}`,
                            addedAt: new Date()
                        }
                    }
                })
            )).catch(err => logger.error('Error updating media usage', { error: err.message }));
        }

        await deletePattern('/api/product/list*');
        await deletePattern('products:*');

        return await productModel.findById(id).populate('category', 'name slug active');
    }

    /**
     * List products
     */
    async listProducts(queryOptions) {
        const { inStockOnly, includeDeleted } = queryOptions;
        let query = {};

        if (includeDeleted !== 'true') {
            query.active = { $ne: false };
        }

        if (inStockOnly === 'true') {
            query.stock = { $gt: 0 };
        }

        const products = await productModel
            .find(query)
            .select('name description basePrice image category subCategory bestseller date stock slug sku active')
            .populate('category', 'name slug active')
            .sort({ date: -1 })
            .lean();

        return products;
    }

    /**
     * Remove product
     */
    async removeProduct(id) {
        await productModel.findByIdAndDelete(id);
    }

    /**
     * Get single product
     */
    async getProductById(id) {
        const product = await productModel.findById(id).populate('category', 'name slug active');
        if (!product) throw new Error("Product not found");
        return product;
    }

    /**
     * Get product by SKU
     */
    async getProductBySku(sku) {
        const product = await productModel.findOne({ sku: sku.toUpperCase() }).populate('category', 'name slug active');
        if (!product) throw new Error(`Ürün bulunamadı: ${sku}`);
        return product;
    }

    /**
     * Get product by Barcode
     */
    async getProductByBarcode(barcode) {
        const product = await productModel.findOne({ barcode }).populate('category', 'name slug active');
        if (!product) throw new Error(`Barkod bulunamadı: ${barcode}`);
        return product;
    }

    /**
     * Soft delete product
     */
    async softDeleteProduct(id, adminId) {
        const product = await productModel.findByIdAndUpdate(
            id,
            {
                active: false,
                deletedAt: new Date(),
                deletedBy: adminId
            },
            { new: true }
        );

        if (!product) throw new Error("Ürün bulunamadı");
        return product;
    }

    /**
     * Restore product
     */
    async restoreProduct(id) {
        const product = await productModel.findByIdAndUpdate(
            id,
            {
                active: true,
                deletedAt: null,
                deletedBy: null
            },
            { new: true }
        );

        if (!product) throw new Error("Ürün bulunamadı");
        return product;
    }

    /**
     * Permanent delete product
     */
    async permanentDeleteProduct(id) {
        const product = await productModel.findById(id);
        if (!product) throw new Error("Ürün bulunamadı");

        if (product.image && product.image.length > 0) {
            try {
                await Media.deleteMany({
                    'usedIn.type': 'product',
                    'usedIn.id': id
                });
            } catch (mediaError) {
                logger.error('Error deleting media files', { error: mediaError.message });
            }
        }

        await productModel.findByIdAndDelete(id);
    }

    /**
     * Quick update product
     */
    async quickUpdateProduct(id, field, value) {
        const allowedFields = ['stock', 'basePrice', 'category', 'bestseller', 'active'];

        if (!allowedFields.includes(field)) {
            throw new Error("Bu alan hızlı güncellenemez");
        }

        const product = await productModel.findByIdAndUpdate(
            id,
            { [field]: value },
            { new: true, runValidators: true }
        );

        if (!product) throw new Error("Ürün bulunamadı");
        return product;
    }

    /**
     * Get price range
     */
    async getPriceRange() {
        const products = await productModel.find({ active: true }).select('basePrice');

        if (products.length === 0) {
            return { minPrice: 0, maxPrice: 1000 };
        }

        const prices = products
            .map(product => Number(product.basePrice))
            .filter(price => Number.isFinite(price) && price >= 0);

        if (prices.length === 0) {
            return { minPrice: 0, maxPrice: 1000 };
        }

        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));

        return {
            minPrice,
            maxPrice: Math.max(minPrice, maxPrice)
        };
    }
}

export default new ProductService();
