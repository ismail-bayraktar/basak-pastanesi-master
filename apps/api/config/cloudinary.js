import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import logger from "../utils/logger.js";

const connectCloudinary = async () => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            logger.warn("Cloudinary credentials not configured. Image upload features will be disabled.");
            return;
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        logger.info("Cloudinary configured successfully");
    } catch (error) {
        logger.error("Cloudinary configuration failed", { error: error.message, stack: error.stack });
    }
}

// Enhanced storage with transformations
const getCloudinaryStorage = (folder = 'basak-pastanesi') => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folder,
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [
                { width: 2000, height: 2000, crop: 'limit', quality: 'auto' },
                { fetch_format: 'auto' }
            ],
            unique_filename: true
        },
        filename: (req, file, cb) => {
            const name = file.originalname.split('.')[0];
            const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
            cb(null, cleanName);
        }
    });
}

// Image transformation utilities
const generateResponsiveImages = (publicId, options = {}) => {
    if (!publicId) return [];

    const sizes = [
        { name: 'thumbnail', width: 150, height: 150 },
        { name: 'small', width: 300, height: 300 },
        { name: 'medium', width: 600, height: 600 },
        { name: 'large', width: 1200, height: 1200 }
    ];

    return sizes.map(size => ({
        name: size.name,
        url: cloudinary.url(publicId, {
            width: size.width,
            height: size.height,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
            ...options
        }),
        width: size.width,
        height: size.height
    }));
}

// Get optimized image URL
const getOptimizedUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        quality: 'auto',
        fetch_format: 'auto',
        crop: 'fill',
        ...options
    });
}

/**
 * Generate signed upload parameters for direct frontend upload
 * This enables Shopify-style direct uploads bypassing the backend
 * @param {string} folder - Target folder in Cloudinary
 * @param {Object} options - Additional upload options
 * @returns {Object} Signed upload parameters
 */
const generateSignedUploadParams = (folder = 'basak-pastanesi', options = {}) => {
    const timestamp = Math.round(Date.now() / 1000);

    // Parameters that will be signed - these MUST match what frontend sends
    const paramsToSign = {
        timestamp,
        folder
    };

    // Generate signature using api_sign_request (synchronous function)
    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder
    };
}

/**
 * Delete media from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info('Cloudinary deletion', { publicId, result: result.result });
        return result;
    } catch (error) {
        logger.error('Cloudinary deletion failed', { publicId, error: error.message });
        throw error;
    }
}

export default connectCloudinary;
export {
    getCloudinaryStorage,
    generateResponsiveImages,
    getOptimizedUrl,
    generateSignedUploadParams,
    deleteFromCloudinary,
    cloudinary
};