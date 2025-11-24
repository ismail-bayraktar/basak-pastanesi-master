import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/mongodb.js';
import Slider from '../models/SliderModel.js';
import logger from '../utils/logger.js';

dotenv.config();

async function cleanRelativeUrls() {
    try {
        logger.info('Connecting to database...');
        await connectDB();

        logger.info('Searching for sliders with /uploads/ paths...');
        const sliders = await Slider.find({
            $or: [
                { image: { $regex: '^/uploads/', $options: 'i' } },
                { image: { $regex: 'default-slider', $options: 'i' } }
            ]
        });

        logger.info(`Found ${sliders.length} sliders with relative/default paths`);

        for (const slider of sliders) {
            logger.info(`Slider ${slider._id}: image="${slider.image}", title="${slider.title || 'Untitled'}"`);
            
            // Remove sliders with default/placeholder images
            if (slider.image && (slider.image.includes('default-slider') || slider.image.startsWith('/uploads/'))) {
                await Slider.deleteOne({ _id: slider._id });
                logger.warn(`Deleted slider ${slider._id} with placeholder image: ${slider.image}`);
            }
        }

        logger.info('✅ Cleanup completed!');
    } catch (error) {
        logger.error('Error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        logger.info('Database connection closed');
    }
}

cleanRelativeUrls()
    .then(() => process.exit(0))
    .catch((error) => {
        logger.error('Script failed:', error);
        process.exit(1);
    });
