import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/mongodb.js';
import Slider from '../models/SliderModel.js';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

const sampleSliders = [
    {
        template: 'split-left',
        title: 'Taze Baklava Dünyası',
        subtitle: 'Geleneksel Lezzetler',
        description: 'Her gün taze üretilen el yapımı baklavalarımızla damak tadınıza hitap ediyoruz',
        buttonText: 'Ürünleri İncele',
        buttonLink: '/collection',
        buttonStyle: 'primary',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=600&fit=crop', // Placeholder
        overlayOpacity: 30,
        textColor: 'auto',
        altText: 'Taze baklava çeşitleri',
        seoTitle: 'El Yapımı Taze Baklavalar - Basak Pastanesi',
        order: 0,
        isActive: true
    },
    {
        template: 'centered',
        title: 'Özel Gün Paketleri',
        subtitle: 'Sevdiklerinize Özel',
        description: 'Doğum günü, düğün ve özel günleriniz için hazırlanmış lüks paketler',
        buttonText: 'Paketleri Gör',
        buttonLink: '/collection',
        buttonStyle: 'secondary',
        image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&h=600&fit=crop', // Placeholder
        overlayOpacity: 40,
        textColor: 'light',
        altText: 'Özel gün baklava paketleri',
        seoTitle: 'Özel Gün Baklava Paketleri - Basak Pastanesi',
        order: 1,
        isActive: true
    },
    {
        template: 'split-right',
        title: 'Aynı Gün Teslimat',
        subtitle: 'Hızlı ve Güvenli',
        description: 'Siparişleriniz aynı gün içinde taze olarak kapınızda',
        buttonText: 'Sipariş Ver',
        buttonLink: '/collection',
        buttonStyle: 'primary',
        image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200&h=600&fit=crop', // Placeholder
        overlayOpacity: 20,
        textColor: 'dark',
        altText: 'Aynı gün teslimat servisi',
        seoTitle: 'Aynı Gün Teslimat - Basak Pastanesi',
        order: 2,
        isActive: true
    }
];

async function seedSliders() {
    try {
        logger.info('Connecting to database...');
        await connectDB();

        // Delete all existing sliders
        const deleteResult = await Slider.deleteMany({});
        logger.info(`Deleted ${deleteResult.deletedCount} existing sliders`);

        // Insert new sliders
        const sliders = await Slider.insertMany(sampleSliders);
        logger.info(`✅ Successfully created ${sliders.length} sliders`);

        // Log slider details
        sliders.forEach((slider, index) => {
            logger.info(`Slider ${index + 1}: ${slider.title} (${slider.template})`);
        });

        logger.info('✅ Slider seeding completed successfully!');

    } catch (error) {
        logger.error('Error seeding sliders:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        logger.info('Database connection closed');
    }
}

// Run the seed
seedSliders()
    .then(() => {
        logger.info('Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        logger.error('Script failed:', error);
        process.exit(1);
    });
