import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/mongodb.js';
import productModel from '../models/ProductModel.js';
import Slider from '../models/SliderModel.js';
import Media from '../models/MediaModel.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

const LOCALHOST_PATTERN = /http:\/\/localhost:\d+/g;
const PRODUCTION_BACKEND = 'https://backend-eight-indol-19.vercel.app';

async function cleanLocalhostUrls() {
    try {
        logger.info('Connecting to database...');
        await connectDB();

        logger.info('Starting localhost URL cleanup...');

        // Clean Products
        logger.info('Cleaning Product images...');
        const products = await productModel.find({
            image: { $regex: 'localhost', $options: 'i' }
        });

        logger.info(`Found ${products.length} products with localhost URLs`);

        for (const product of products) {
            const updatedImages = product.image.map(img => {
                if (img && img.includes('localhost')) {
                    // Remove localhost URLs entirely (prefer Cloudinary)
                    logger.warn(`Removing localhost URL from product ${product._id}: ${img}`);
                    return null;
                }
                return img;
            }).filter(img => img !== null);

            product.image = updatedImages;
            await product.save();
            logger.info(`Updated product ${product._id} (${product.name})`);
        }

        // Clean Sliders
        logger.info('Cleaning Slider images...');
        const sliders = await Slider.find({
            $or: [
                { image: { $regex: 'localhost', $options: 'i' } },
                { mobileImage: { $regex: 'localhost', $options: 'i' } },
                { backgroundImage: { $regex: 'localhost', $options: 'i' } }
            ]
        });

        logger.info(`Found ${sliders.length} sliders with localhost URLs`);

        for (const slider of sliders) {
            let updated = false;

            if (slider.image && slider.image.includes('localhost')) {
                logger.warn(`Removing localhost URL from slider ${slider._id}: ${slider.image}`);
                slider.image = '';
                updated = true;
            }

            if (slider.mobileImage && slider.mobileImage.includes('localhost')) {
                logger.warn(`Removing localhost mobileImage from slider ${slider._id}`);
                slider.mobileImage = '';
                updated = true;
            }

            if (slider.backgroundImage && slider.backgroundImage.includes('localhost')) {
                logger.warn(`Removing localhost backgroundImage from slider ${slider._id}`);
                slider.backgroundImage = '';
                updated = true;
            }

            if (updated) {
                await slider.save();
                logger.info(`Updated slider ${slider._id} (${slider.title || 'Untitled'})`);
            }
        }

        // Clean Media collection
        logger.info('Cleaning Media collection...');
        const mediaItems = await Media.find({
            $or: [
                { url: { $regex: 'localhost', $options: 'i' } },
                { secureUrl: { $regex: 'localhost', $options: 'i' } },
                { path: { $regex: 'localhost', $options: 'i' } }
            ]
        });

        logger.info(`Found ${mediaItems.length} media items with localhost URLs`);

        for (const media of mediaItems) {
            let updated = false;

            if (media.url && media.url.includes('localhost')) {
                logger.warn(`Removing localhost URL from media ${media._id}: ${media.url}`);
                await Media.deleteOne({ _id: media._id });
                logger.info(`Deleted media ${media._id} (localhost URL)`);
                continue;
            }

            if (media.secureUrl && media.secureUrl.includes('localhost')) {
                media.secureUrl = media.secureUrl.replace(LOCALHOST_PATTERN, PRODUCTION_BACKEND);
                updated = true;
            }

            if (media.path && media.path.includes('localhost')) {
                media.path = media.path.replace(LOCALHOST_PATTERN, PRODUCTION_BACKEND);
                updated = true;
            }

            if (updated) {
                await media.save();
                logger.info(`Updated media ${media._id}`);
            }
        }

        logger.info('✅ Localhost URL cleanup completed successfully!');

        // Summary
        logger.info('Summary:');
        logger.info(`- Products cleaned: ${products.length}`);
        logger.info(`- Sliders cleaned: ${sliders.length}`);
        logger.info(`- Media items processed: ${mediaItems.length}`);

    } catch (error) {
        logger.error('Error cleaning localhost URLs:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        logger.info('Database connection closed');
    }
}

// Run the cleanup
cleanLocalhostUrls()
    .then(() => {
        logger.info('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        logger.error('Script failed:', error);
        process.exit(1);
    });
