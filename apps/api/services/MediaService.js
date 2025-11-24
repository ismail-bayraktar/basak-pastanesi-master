import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { getCloudinaryStorage, generateResponsiveImages, cloudinary } from '../config/cloudinary.js';
import Media from '../models/MediaModel.js';
import logger from '../utils/logger.js';
import { getSettingsByCategory } from '../utils/initializeSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MediaService - Unified media handling service
 * Supports both Cloudinary (CDN) and Local storage with Sharp.js optimization
 */
class MediaService {
    constructor() {
        this.uploadDir = path.join(__dirname, '..', 'uploads');
        this.defaultSettings = {
            useCloudinary: true,
            autoOptimize: true,
            generateResponsive: true,
            quality: 80,
            responsiveSizes: {
                thumbnail: { width: 150, height: 150 },
                small: { width: 400, height: 400 },
                medium: { width: 800, height: 800 },
                large: { width: 1200, height: 1200 }
            }
        };
    }

    /**
     * Get media settings from database or use defaults
     * @returns {Promise<Object>} Media settings
     */
    async getSettings() {
        try {
            const dbSettings = await getSettingsByCategory('media');

            // Merge with defaults (database settings override defaults)
            return {
                ...this.defaultSettings,
                ...dbSettings
            };
        } catch (error) {
            logger.error('Failed to get media settings', { error: error.message });
            return this.defaultSettings;
        }
    }

    /**
     * Upload media with automatic routing to Cloudinary or Local storage
     * @param {Object} file - Multer file object
     * @param {Object} options - Upload options (folder, category, metadata)
     * @returns {Promise<Object>} Media document
     */
    async uploadMedia(file, options = {}) {
        const settings = await this.getSettings();

        logger.info('Uploading media', {
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            useCloudinary: settings.useCloudinary,
            autoOptimize: settings.autoOptimize
        });

        if (settings.useCloudinary) {
            return await this.uploadToCloudinary(file, options, settings);
        } else {
            return await this.uploadToLocal(file, options, settings);
        }
    }

    /**
     * Upload to Cloudinary CDN
     * @param {Object} file - Multer file object
     * @param {Object} options - Upload options
     * @param {Object} settings - Media settings
     * @returns {Promise<Object>} Media document
     */
    async uploadToCloudinary(file, options, settings) {
        try {
            const folder = options.folder || 'general';

            // Upload directly to Cloudinary using SDK (bypass multer-storage-cloudinary)
            const uploadOptions = {
                folder: `basak-pastanesi/${folder}`,
                resource_type: 'auto',
                transformation: [
                    { width: 2000, height: 2000, crop: 'limit', quality: 'auto' },
                    { fetch_format: 'auto' }
                ],
                unique_filename: true
            };

            // Upload buffer to Cloudinary
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                // Write buffer to stream
                uploadStream.end(file.buffer);
            });

            // Generate responsive URLs
            const responsiveImages = settings.generateResponsive
                ? generateResponsiveImages(result.public_id)
                : [];

            // Create media document
            const media = new Media({
                filename: result.original_filename || file.originalname,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: result.bytes || file.size,
                publicId: result.public_id,
                url: result.url,
                secureUrl: result.secure_url,
                resourceType: result.resource_type || 'image',
                format: result.format,
                width: result.width,
                height: result.height,
                aspectRatio: result.width / result.height,
                bytes: result.bytes,
                responsive: {
                    thumbnail: responsiveImages.find(img => img.name === 'thumbnail')?.url,
                    small: responsiveImages.find(img => img.name === 'small')?.url,
                    medium: responsiveImages.find(img => img.name === 'medium')?.url,
                    large: responsiveImages.find(img => img.name === 'large')?.url
                },
                alt: options.alt || file.originalname,
                title: options.title || file.originalname,
                description: options.description || '',
                folder: folder,
                category: options.category || 'general',
                tags: options.tags || [],
                uploadedBy: options.uploadedBy || 'admin',
                processing: {
                    status: 'completed',
                    optimized: true,
                    cloudinary: true
                }
            });

            await media.save();

            logger.info('Media uploaded to Cloudinary successfully', {
                id: media._id,
                publicId: media.publicId,
                url: media.secureUrl
            });

            return media;
        } catch (error) {
            logger.error('Cloudinary upload failed', {
                error: error.message,
                stack: error.stack,
                filename: file.originalname
            });
            throw error;
        }
    }

    /**
     * Upload to Local storage with Sharp.js optimization
     * @param {Object} file - Multer file object
     * @param {Object} options - Upload options
     * @param {Object} settings - Media settings
     * @returns {Promise<Object>} Media document
     */
    async uploadToLocal(file, options, settings) {
        try {
            const folder = options.folder || 'general';
            const timestamp = Date.now();
            const ext = path.extname(file.originalname);
            const basename = path.basename(file.originalname, ext);
            const filename = `${timestamp}-${basename}${ext}`;

            // Create folder structure
            const categoryFolder = path.join(this.uploadDir, folder);
            await fs.mkdir(categoryFolder, { recursive: true });

            const filepath = path.join(categoryFolder, filename);
            const relativeUrl = `/uploads/${folder}/${filename}`;

            // Get image metadata
            const metadata = await sharp(file.buffer).metadata();

            let processedBuffer = file.buffer;
            let width = metadata.width;
            let height = metadata.height;

            // Optimize if enabled
            if (settings.autoOptimize && this.isImage(file.mimetype)) {
                const sharpInstance = sharp(file.buffer);

                // Auto-rotate based on EXIF
                sharpInstance.rotate();

                // Optimize based on format
                if (ext === '.jpg' || ext === '.jpeg') {
                    sharpInstance.jpeg({ quality: settings.quality, progressive: true });
                } else if (ext === '.png') {
                    sharpInstance.png({ quality: settings.quality, compressionLevel: 9 });
                } else if (ext === '.webp') {
                    sharpInstance.webp({ quality: settings.quality });
                }

                processedBuffer = await sharpInstance.toBuffer();
            }

            // Save main file
            await fs.writeFile(filepath, processedBuffer);

            // Generate responsive versions
            const responsive = {};
            if (settings.generateResponsive && this.isImage(file.mimetype)) {
                responsive.thumbnail = await this.generateResponsiveLocal(
                    processedBuffer,
                    categoryFolder,
                    `${timestamp}-${basename}-thumbnail${ext}`,
                    folder,
                    settings.responsiveSizes.thumbnail,
                    settings.quality
                );
                responsive.small = await this.generateResponsiveLocal(
                    processedBuffer,
                    categoryFolder,
                    `${timestamp}-${basename}-small${ext}`,
                    folder,
                    settings.responsiveSizes.small,
                    settings.quality
                );
                responsive.medium = await this.generateResponsiveLocal(
                    processedBuffer,
                    categoryFolder,
                    `${timestamp}-${basename}-medium${ext}`,
                    folder,
                    settings.responsiveSizes.medium,
                    settings.quality
                );
                responsive.large = await this.generateResponsiveLocal(
                    processedBuffer,
                    categoryFolder,
                    `${timestamp}-${basename}-large${ext}`,
                    folder,
                    settings.responsiveSizes.large,
                    settings.quality
                );
            }

            // Create media document
            const media = new Media({
                filename: filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: processedBuffer.length,
                url: relativeUrl,
                resourceType: this.isImage(file.mimetype) ? 'image' : 'file',
                format: ext.replace('.', ''),
                width: width,
                height: height,
                aspectRatio: width / height,
                bytes: processedBuffer.length,
                responsive: responsive,
                alt: options.alt || file.originalname,
                title: options.title || file.originalname,
                description: options.description || '',
                folder: folder,
                category: options.category || 'general',
                tags: options.tags || [],
                uploadedBy: options.uploadedBy || 'admin',
                processing: {
                    status: 'completed',
                    optimized: settings.autoOptimize,
                    cloudinary: false
                }
            });

            await media.save();

            logger.info('Media uploaded to local storage successfully', {
                id: media._id,
                filename: media.filename,
                url: media.url,
                size: media.size,
                optimized: settings.autoOptimize
            });

            return media;
        } catch (error) {
            logger.error('Local upload failed', {
                error: error.message,
                stack: error.stack,
                filename: file.originalname
            });
            throw error;
        }
    }

    /**
     * Generate responsive image version locally
     * @param {Buffer} buffer - Image buffer
     * @param {String} folder - Target folder
     * @param {String} filename - Output filename
     * @param {String} categoryFolder - Category folder name
     * @param {Object} size - Target size {width, height}
     * @param {Number} quality - Image quality
     * @returns {Promise<String>} Relative URL
     */
    async generateResponsiveLocal(buffer, folder, filename, categoryFolder, size, quality) {
        try {
            const filepath = path.join(folder, filename);

            await sharp(buffer)
                .resize(size.width, size.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: quality, progressive: true })
                .toFile(filepath);

            return `/uploads/${categoryFolder}/${filename}`;
        } catch (error) {
            logger.error('Responsive image generation failed', {
                error: error.message,
                filename: filename
            });
            return null;
        }
    }

    /**
     * Check if mimetype is an image
     * @param {String} mimetype - File mimetype
     * @returns {Boolean}
     */
    isImage(mimetype) {
        return mimetype && mimetype.startsWith('image/');
    }

    /**
     * Delete media (both file and database record)
     * Cloudinary deletion is done asynchronously for faster response
     * @param {String} mediaId - Media ID
     * @returns {Promise<Boolean>} Success status
     */
    async deleteMedia(mediaId) {
        try {
            const media = await Media.findById(mediaId);
            if (!media) {
                throw new Error('Media not found');
            }

            // Store info before deletion for async operations
            const publicId = media.publicId;
            const localUrl = media.url;
            const responsive = media.responsive;

            // Delete database record first (fast operation)
            await Media.findByIdAndDelete(mediaId);

            // Delete from Cloudinary with quick timeout
            // In serverless, we need to complete within the function lifetime
            if (publicId) {
                try {
                    // Quick deletion attempt (5 second timeout)
                    const deletePromise = cloudinary.uploader.destroy(publicId);
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Cloudinary deletion timeout')), 5000)
                    );

                    const result = await Promise.race([deletePromise, timeoutPromise]);

                    if (result.result === 'ok' || result.result === 'not found') {
                        logger.info('Cloudinary deletion successful', {
                            mediaId,
                            publicId,
                            result: result.result
                        });
                    } else {
                        logger.warn('Cloudinary deletion unexpected result', {
                            mediaId,
                            publicId,
                            result: result.result
                        });
                    }
                } catch (cloudinaryError) {
                    // Log but don't fail - DB record is already deleted
                    logger.error('CLOUDINARY_DELETION_FAILED', {
                        mediaId,
                        publicId,
                        error: cloudinaryError.message,
                        message: 'Cloudinary deletion failed. Manual cleanup may be required.',
                        timestamp: new Date().toISOString()
                    });
                }
            }
            // Delete from local storage (still sync for local files)
            else if (localUrl) {
                const filepath = path.join(__dirname, '..', localUrl);
                await fs.unlink(filepath).catch(() => {});

                // Delete responsive versions
                if (responsive) {
                    for (const [key, url] of Object.entries(responsive)) {
                        if (url) {
                            const responsivePath = path.join(__dirname, '..', url);
                            await fs.unlink(responsivePath).catch(() => {});
                        }
                    }
                }
                logger.info('Media deleted from local storage', { url: localUrl });
            }

            logger.info('Media deleted successfully', { id: mediaId });
            return true;
        } catch (error) {
            logger.error('Media deletion failed', {
                error: error.message,
                mediaId: mediaId
            });
            throw error;
        }
    }

}

export default new MediaService();
