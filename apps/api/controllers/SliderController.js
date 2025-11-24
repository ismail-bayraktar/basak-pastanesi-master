import Slider from '../models/SliderModel.js';
import Media from '../models/MediaModel.js';
import logger from '../utils/logger.js';
import MediaService from '../services/MediaService.js';

// Get all sliders for frontend
const listSliders = async (req, res) => {
    try {
        const now = new Date();
        const sliders = await Slider.find({
            isActive: true,
            $or: [
                { startDate: { $exists: false } },
                { startDate: { $lte: now } }
            ],
            $or: [
                { endDate: { $exists: false } },
                { endDate: { $gte: now } }
            ]
        }).sort({ order: 1 });

        res.json({ success: true, sliders });
    } catch (error) {
        logger.error('Error listing sliders', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: "Sliderler listelenemedi" });
    }
};

// Get all sliders for admin (including inactive)
const listSlidersAdmin = async (req, res) => {
    try {
        logger.info('Admin slider list requested', { adminEmail: req.admin?.email });
        const sliders = await Slider.find({}).sort({ order: 1 });
        logger.info(`Found ${sliders.length} sliders`);
        res.json({ success: true, sliders });
    } catch (error) {
        logger.error('Error in listSlidersAdmin', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: "Sliderler listelenemedi" });
    }
};

// Track slider view
const trackSliderView = async (req, res) => {
    try {
        const { id } = req.params;
        await Slider.findByIdAndUpdate(id, {
            $inc: { viewCount: 1 },
            lastViewed: new Date()
        });
        res.json({ success: true });
    } catch (error) {
        logger.error('Error tracking slider view', { error: error.message, stack: error.stack, sliderId: req.params.id });
        res.status(500).json({ success: false, message: "View takibi yapılamadı" });
    }
};

// Track slider click
const trackSliderClick = async (req, res) => {
    try {
        const { id } = req.params;
        await Slider.findByIdAndUpdate(id, {
            $inc: { clickCount: 1 }
        });
        res.json({ success: true });
    } catch (error) {
        logger.error('Error tracking slider click', { error: error.message, stack: error.stack, sliderId: req.params.id });
        res.status(500).json({ success: false, message: "Click takibi yapılamadı" });
    }
};

// Add new slider
const addSlider = async (req, res) => {
    try {
        const {
            title, subtitle, description, buttonText, buttonLink,
            template, buttonStyle,
            overlayOpacity, textColor, altText, seoTitle,
            order, startDate, endDate
        } = req.body;

        let image = '';
        let mobileImage = '';
        let backgroundImage = '';

        // Handle multiple file uploads via MediaService
        if (req.files) {
            // Main image
            if (req.files.image && req.files.image[0]) {
                try {
                    const media = await MediaService.uploadMedia(req.files.image[0], {
                        folder: 'sliders',
                        category: 'slider',
                        alt: altText || title || 'Slider image',
                        title: seoTitle || title || 'Slider',
                        uploadedBy: 'admin'
                    });
                    image = media.secureUrl || media.url;
                    logger.info('Slider main image uploaded via MediaService', { url: image });
                } catch (uploadError) {
                    logger.error('Failed to upload slider main image', { error: uploadError.message });
                    return res.status(500).json({ success: false, message: "Ana görsel yüklenemedi" });
                }
            }

            // Mobile image
            if (req.files.mobileImage && req.files.mobileImage[0]) {
                try {
                    const media = await MediaService.uploadMedia(req.files.mobileImage[0], {
                        folder: 'sliders',
                        category: 'slider',
                        alt: `${altText || title} - Mobile`,
                        title: `${seoTitle || title} - Mobile`,
                        uploadedBy: 'admin'
                    });
                    mobileImage = media.secureUrl || media.url;
                } catch (uploadError) {
                    logger.error('Failed to upload slider mobile image', { error: uploadError.message });
                }
            }

            // Background image
            if (req.files.backgroundImage && req.files.backgroundImage[0]) {
                try {
                    const media = await MediaService.uploadMedia(req.files.backgroundImage[0], {
                        folder: 'sliders',
                        category: 'slider',
                        alt: `${altText || title} - Background`,
                        title: `${seoTitle || title} - Background`,
                        uploadedBy: 'admin'
                    });
                    backgroundImage = media.secureUrl || media.url;
                } catch (uploadError) {
                    logger.error('Failed to upload slider background image', { error: uploadError.message });
                }
            }
        }

        // Validate required image
        if (!image) {
            return res.status(400).json({ success: false, message: "Ana görsel zorunludur" });
        }

        const slider = new Slider({
            template: template || 'split-left',
            title,
            subtitle,
            description,
            buttonText,
            buttonLink: buttonLink || '/collection',
            buttonStyle: buttonStyle || 'primary',
            image,
            mobileImage: mobileImage || undefined,
            backgroundImage: backgroundImage || undefined,
            overlayOpacity: parseInt(overlayOpacity) || 0,
            textColor: textColor || 'auto',
            altText: altText || '',
            seoTitle: seoTitle || '',
            order: parseInt(order) || 0,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });

        await slider.save();
        logger.info('Slider created', { sliderId: slider._id, title: slider.title });
        res.json({ success: true, message: "Slider eklendi", slider });
    } catch (error) {
        logger.error('Error creating slider', { error: error.message, stack: error.stack, body: req.body });
        res.status(500).json({ success: false, message: "Slider eklenemedi" });
    }
};

// Update slider
const updateSlider = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, subtitle, description, buttonText, buttonLink,
            template, buttonStyle,
            overlayOpacity, textColor, altText, seoTitle,
            order, isActive, startDate, endDate
        } = req.body;

        const updateData = {
            template: template || 'split-left',
            title,
            subtitle,
            description,
            buttonText,
            buttonLink: buttonLink || '/collection',
            buttonStyle: buttonStyle || 'primary',
            overlayOpacity: parseInt(overlayOpacity) || 0,
            textColor: textColor || 'auto',
            altText: altText || '',
            seoTitle: seoTitle || '',
            order: parseInt(order) || 0,
            isActive: isActive !== undefined ? isActive : true
        };

        // Handle multiple file uploads via MediaService
        if (req.files) {
            // Main image
            if (req.files.image && req.files.image[0]) {
                try {
                    const media = await MediaService.uploadMedia(req.files.image[0], {
                        folder: 'sliders',
                        category: 'slider',
                        alt: altText || title || 'Slider image',
                        title: seoTitle || title || 'Slider',
                        uploadedBy: 'admin'
                    });
                    updateData.image = media.secureUrl || media.url;
                } catch (uploadError) {
                    logger.error('Failed to upload slider main image during update', { error: uploadError.message });
                }
            }

            // Mobile image
            if (req.files.mobileImage && req.files.mobileImage[0]) {
                try {
                    const media = await MediaService.uploadMedia(req.files.mobileImage[0], {
                        folder: 'sliders',
                        category: 'slider',
                        alt: `${altText || title} - Mobile`,
                        title: `${seoTitle || title} - Mobile`,
                        uploadedBy: 'admin'
                    });
                    updateData.mobileImage = media.secureUrl || media.url;
                } catch (uploadError) {
                    logger.error('Failed to upload slider mobile image during update', { error: uploadError.message });
                }
            }

            // Background image
            if (req.files.backgroundImage && req.files.backgroundImage[0]) {
                try {
                    const media = await MediaService.uploadMedia(req.files.backgroundImage[0], {
                        folder: 'sliders',
                        category: 'slider',
                        alt: `${altText || title} - Background`,
                        title: `${seoTitle || title} - Background`,
                        uploadedBy: 'admin'
                    });
                    updateData.backgroundImage = media.secureUrl || media.url;
                } catch (uploadError) {
                    logger.error('Failed to upload slider background image during update', { error: uploadError.message });
                }
            }
        }

        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);

        await Slider.findByIdAndUpdate(id, updateData);
        logger.info('Slider updated', { sliderId: id });

        // Fetch the updated slider to return to frontend
        const updatedSlider = await Slider.findById(id);
        res.json({ success: true, message: "Slider güncellendi", slider: updatedSlider });
    } catch (error) {
        logger.error('Error updating slider', { error: error.message, stack: error.stack, sliderId: req.params.id });
        res.status(500).json({ success: false, message: "Slider güncellenemedi" });
    }
};

// Delete slider
const deleteSlider = async (req, res) => {
    try {
        const { id } = req.params;
        await Slider.findByIdAndDelete(id);
        logger.info('Slider deleted', { sliderId: id });
        res.json({ success: true, message: "Slider silindi" });
    } catch (error) {
        logger.error('Error deleting slider', { error: error.message, stack: error.stack, sliderId: id });
        res.status(500).json({ success: false, message: "Slider silinemedi" });
    }
};

export {
    listSliders,
    listSlidersAdmin,
    trackSliderView,
    trackSliderClick,
    addSlider,
    updateSlider,
    deleteSlider
};
