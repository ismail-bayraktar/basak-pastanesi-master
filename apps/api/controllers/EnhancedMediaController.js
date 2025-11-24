import Media from '../models/MediaModel.js';
import { getOptimizedUrl, generateSignedUploadParams, generateResponsiveImages, deleteFromCloudinary } from '../config/cloudinary.js';
import logger from '../utils/logger.js';
import MediaService from '../services/MediaService.js';

/**
 * Get signed upload parameters for direct Cloudinary upload
 * Frontend calls this before uploading directly to Cloudinary
 */
const getUploadSignature = async (req, res) => {
    try {
        const folder = req.query.folder || 'basak-pastanesi/general';

        // Debug: Check if env variables are loaded
        const envCheck = {
            hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
            hasApiKey: !!process.env.CLOUDINARY_API_KEY,
            hasSecretKey: !!process.env.CLOUDINARY_API_SECRET,
            cloudNameValue: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET'
        };

        logger.info('Upload signature request', { folder, envCheck });

        const signedParams = generateSignedUploadParams(folder);

        logger.info('Upload signature generated', {
            folder,
            cloudName: signedParams.cloudName,
            hasSignature: !!signedParams.signature,
            timestamp: signedParams.timestamp
        });

        res.json({
            success: true,
            ...signedParams
        });
    } catch (error) {
        logger.error('Upload signature error', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'İmza oluşturulamadı',
            error: error.message
        });
    }
};

/**
 * Register media after direct Cloudinary upload
 * Frontend calls this after successful Cloudinary upload
 */
const registerUpload = async (req, res) => {
    try {
        const {
            publicId,
            url,
            secureUrl,
            format,
            width,
            height,
            bytes,
            resourceType,
            originalFilename,
            // Metadata from frontend
            folder,
            category,
            alt,
            title,
            description,
            tags
        } = req.body;

        if (!publicId || !secureUrl) {
            return res.status(400).json({
                success: false,
                message: 'publicId ve secureUrl gereklidir'
            });
        }

        // Generate responsive URLs
        const responsiveImages = generateResponsiveImages(publicId);

        // Create media document
        const media = new Media({
            filename: originalFilename || publicId.split('/').pop(),
            originalName: originalFilename || publicId.split('/').pop(),
            mimetype: `image/${format}`,
            size: bytes,
            publicId,
            url,
            secureUrl,
            resourceType: resourceType || 'image',
            format,
            width,
            height,
            aspectRatio: width && height ? width / height : 1,
            bytes,
            responsive: {
                thumbnail: responsiveImages.find(img => img.name === 'thumbnail')?.url,
                small: responsiveImages.find(img => img.name === 'small')?.url,
                medium: responsiveImages.find(img => img.name === 'medium')?.url,
                large: responsiveImages.find(img => img.name === 'large')?.url
            },
            alt: alt || originalFilename || publicId,
            title: title || originalFilename || publicId,
            description: description || '',
            folder: folder || 'general',
            category: category || 'general',
            tags: tags || [],
            uploadedBy: 'admin',
            uploadIP: req.ip,
            deviceInfo: {
                userAgent: req.get('User-Agent'),
                platform: req.get('Sec-Ch-UA-Platform')
            },
            processing: {
                status: 'completed',
                optimized: true,
                cloudinary: true
            }
        });

        await media.save();

        logger.info('Media registered from direct upload', {
            id: media._id,
            publicId,
            url: secureUrl
        });

        res.json({
            success: true,
            message: 'Medya başarıyla kaydedildi',
            media: {
                id: media._id,
                filename: media.filename,
                originalName: media.originalName,
                publicId: media.publicId,
                url: media.secureUrl || media.url,
                mimetype: media.mimetype,
                size: media.size,
                width: media.width,
                height: media.height,
                format: media.format,
                responsive: media.responsive,
                alt: media.alt,
                title: media.title,
                category: media.category,
                folder: media.folder,
                tags: media.tags,
                createdAt: media.createdAt
            }
        });
    } catch (error) {
        logger.error('Register upload error', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: 'Medya kaydedilemedi',
            error: error.message
        });
    }
};

// Upload media using unified MediaService (supports single and bulk upload)
const uploadMedia = async (req, res) => {
    try {
        // Check for bulk upload (req.files) or single upload (req.file)
        const files = req.files || (req.file ? [req.file] : []);

        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Dosya yüklenmedi"
            });
        }

        // Prepare upload options
        const options = {
            folder: req.body.folder || 'general',
            category: req.body.category || 'general',
            alt: req.body.alt,
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
            uploadedBy: req.body.uploadedBy || 'admin'
        };

        const uploadedMedia = [];
        const errors = [];

        // Upload each file
        for (const file of files) {
            try {
                // Upload through MediaService (handles Cloudinary or Local based on settings)
                const media = await MediaService.uploadMedia(file, options);

                // Add tracking metadata
                await Media.findByIdAndUpdate(media._id, {
                    uploadIP: req.ip,
                    deviceInfo: {
                        userAgent: req.get('User-Agent'),
                        platform: req.get('Sec-Ch-UA-Platform')
                    }
                });

                uploadedMedia.push({
                    id: media._id,
                    filename: media.filename,
                    originalName: media.originalName,
                    publicId: media.publicId,
                    url: media.secureUrl || media.url,
                    mimetype: media.mimetype,
                    size: media.size,
                    width: media.width,
                    height: media.height,
                    format: media.format,
                    responsive: media.responsive,
                    alt: media.alt,
                    title: media.title,
                    category: media.category,
                    folder: media.folder,
                    tags: media.tags,
                    createdAt: media.createdAt
                });
            } catch (fileError) {
                logger.error('File upload error', {
                    filename: file.originalname,
                    error: fileError.message
                });
                errors.push({
                    filename: file.originalname,
                    error: fileError.message
                });
            }
        }

        // Return appropriate response based on results
        if (uploadedMedia.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Hiçbir dosya yüklenemedi",
                errors
            });
        }

        // Single file response format for backward compatibility
        if (files.length === 1 && uploadedMedia.length === 1) {
            return res.json({
                success: true,
                message: "Medya başarıyla yüklendi",
                media: uploadedMedia[0]
            });
        }

        // Bulk upload response
        res.json({
            success: true,
            message: `${uploadedMedia.length}/${files.length} medya başarıyla yüklendi`,
            uploaded: uploadedMedia.length,
            failed: errors.length,
            media: uploadedMedia,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        logger.error('Enhanced media upload error', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: "Medya yüklenemedi",
            error: error.message
        });
    }
};

// Get media list with advanced filtering
const listMedia = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            folder,
            search,
            mimetype,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { isActive: true };

        if (category && category !== 'all') filter.category = category;
        if (folder && folder !== 'all') filter.folder = folder;
        if (mimetype) filter.mimetype = { $regex: mimetype, $options: 'i' };

        if (search) {
            filter.$or = [
                { originalName: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
                { filename: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const media = await Media.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Media.countDocuments(filter);

        res.json({
            success: true,
            media: media.map(item => ({
                id: item._id,
                filename: item.filename,
                originalName: item.originalName,
                publicId: item.publicId,
                url: item.secureUrl || item.url,
                mimetype: item.mimetype,
                size: item.size,
                width: item.width,
                height: item.height,
                format: item.format,
                responsive: item.responsive,
                alt: item.alt,
                title: item.title,
                description: item.description,
                category: item.category,
                folder: item.folder,
                tags: item.tags,
                views: item.views,
                downloads: item.downloads,
                usedIn: item.usedIn,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
                hasNext: skip + parseInt(limit) < total,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        logger.error('Enhanced media list error', { error: error.message, stack: error.stack, query: req.query });
        res.status(500).json({
            success: false,
            message: "Medya listelenemedi"
        });
    }
};

// Get single media with enhanced details
const getMediaById = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Medya bulunamadı"
            });
        }

        // Track view
        await Media.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 },
            lastViewed: new Date()
        });

        res.json({
            success: true,
            media: {
                id: media._id,
                filename: media.filename,
                originalName: media.originalName,
                publicId: media.publicId,
                url: media.secureUrl || media.url,
                mimetype: media.mimetype,
                size: media.size,
                width: media.width,
                height: media.height,
                aspectRatio: media.aspectRatio,
                format: media.format,
                responsive: media.responsive,
                alt: media.alt,
                title: media.title,
                description: media.description,
                category: media.category,
                folder: media.folder,
                tags: media.tags,
                views: media.views,
                downloads: media.downloads,
                lastViewed: media.lastViewed,
                usedIn: media.usedIn,
                exif: media.exif,
                uploadedBy: media.uploadedBy,
                deviceInfo: media.deviceInfo,
                createdAt: media.createdAt,
                updatedAt: media.updatedAt
            }
        });
    } catch (error) {
        logger.error('Enhanced media get error', { error: error.message, stack: error.stack, mediaId: req.params.id });
        res.status(500).json({
            success: false,
            message: "Medya alınamadı"
        });
    }
};

// Update media metadata
const updateMedia = async (req, res) => {
    try {
        const {
            title,
            alt,
            description,
            folder,
            category,
            tags,
            isPublic
        } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (alt !== undefined) updateData.alt = alt;
        if (description !== undefined) updateData.description = description;
        if (folder !== undefined) updateData.folder = folder;
        if (category !== undefined) updateData.category = category;
        if (tags !== undefined) {
            updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
        }
        if (isPublic !== undefined) updateData.isPublic = isPublic;

        const media = await Media.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Medya bulunamadı"
            });
        }

        res.json({
            success: true,
            message: "Medya güncellendi",
            media
        });
    } catch (error) {
        logger.error('Enhanced media update error', { error: error.message, stack: error.stack, mediaId: req.params.id });
        res.status(500).json({
            success: false,
            message: "Medya güncellenemedi"
        });
    }
};

// Delete media using unified MediaService
const deleteMedia = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Medya bulunamadı"
            });
        }

        // Check usage before deleting (unless force=true)
        const force = req.query.force === 'true' || req.body.force === true;

        if (!force && media.usedIn && media.usedIn.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Bu medya başka yerlerde kullanıldığı için silinemez. Zorla silmek için force parametresini kullanın.",
                usedIn: media.usedIn,
                canForceDelete: true
            });
        }

        // Delete through MediaService (handles Cloudinary or Local)
        await MediaService.deleteMedia(req.params.id);

        res.json({
            success: true,
            message: "Medya silindi"
        });
    } catch (error) {
        logger.error('Enhanced media delete error', { error: error.message, stack: error.stack, mediaId: req.params.id });
        res.status(500).json({
            success: false,
            message: "Medya silinemedi"
        });
    }
};

// Track media usage
const trackUsage = async (req, res) => {
    try {
        const { mediaId, type, id, url } = req.body;

        const media = await Media.findById(mediaId);
        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Medya bulunamadı"
            });
        }

        // Add usage tracking
        const usageEntry = {
            type,
            id,
            url,
            addedAt: new Date()
        };

        // Check if already exists
        const existingUsageIndex = media.usedIn.findIndex(
            usage => usage.type === type && usage.id === id
        );

        if (existingUsageIndex >= 0) {
            // Update existing usage
            media.usedIn[existingUsageIndex] = usageEntry;
        } else {
            // Add new usage
            media.usedIn.push(usageEntry);
        }

        await media.save();

        res.json({
            success: true,
            message: "Kullanım takip edildi"
        });
    } catch (error) {
        logger.error('Media usage tracking error', { error: error.message, stack: error.stack });
        res.status(500).json({
            success: false,
            message: "Kullanım takibi yapılamadı"
        });
    }
};

// Get optimized image URL with transformations
const getOptimizedImage = async (req, res) => {
    try {
        const { publicId, width, height, quality, format } = req.query;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: "Public ID gereklidir"
            });
        }

        const options = {
            quality: quality || 'auto',
            fetch_format: format || 'auto',
            crop: 'fill'
        };

        if (width) options.width = parseInt(width);
        if (height) options.height = parseInt(height);

        const optimizedUrl = getOptimizedUrl(publicId, options);

        res.json({
            success: true,
            url: optimizedUrl,
            options
        });
    } catch (error) {
        logger.error('Optimized image error', { error: error.message, stack: error.stack, mediaId: req.params.id });
        res.status(500).json({
            success: false,
            message: "Görüntü optimize edilemedi"
        });
    }
};

export {
    getUploadSignature,
    registerUpload,
    uploadMedia,
    listMedia,
    getMediaById,
    updateMedia,
    deleteMedia,
    trackUsage,
    getOptimizedImage
};