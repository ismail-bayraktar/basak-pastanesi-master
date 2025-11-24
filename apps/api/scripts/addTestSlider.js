import mongoose from 'mongoose';
import Slider from '../models/SliderModel.js';
import dotenv from 'dotenv';

dotenv.config();

const addTestSlider = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/ecommerce`);
        
        // Önce mevcut slider'ları temizle
        await Slider.deleteMany({});
        
        // Test slider'ı ekle
        const testSlider = new Slider({
            title: "Taze Baklava Dünyası",
            subtitle: "Geleneksel Lezzet, Modern Sunum",
            description: "Antep fıstığıyla hazırlanan özel lezzetler",
            buttonText: "Baklavaları Keşfet",
            image: "/uploads/test-slider.png",
            order: 0,
            isActive: true
        });
        
        await testSlider.save();
        console.log('Test slider başarıyla eklendi!');
        
        mongoose.connection.close();
    } catch (error) {
        console.error('Hata:', error);
        mongoose.connection.close();
    }
};

addTestSlider();
