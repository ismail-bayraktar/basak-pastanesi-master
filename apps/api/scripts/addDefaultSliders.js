import mongoose from 'mongoose';
import Slider from '../models/SliderModel.js';
import dotenv from 'dotenv';

dotenv.config();

const addDefaultSliders = async () => {
    try {
        // MongoDB bağlantısı
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tulumbak';
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB bağlantısı başarılı');

        // Mevcut slider sayısını kontrol et
        const existingCount = await Slider.countDocuments();
        console.log(`📊 Mevcut slider sayısı: ${existingCount}`);

        if (existingCount > 0) {
            console.log('⚠️ Veritabanında zaten slider var. Yeni sliderlar eklenmeyecek.');
            console.log('💡 Mevcut sliderları silmek için: await Slider.deleteMany({})');
            await mongoose.connection.close();
            return;
        }

        // Default sliderları ekle (HeroSlider.jsx'teki default sliderlar)
        const defaultSliders = [
            {
                template: 'split-left',
                title: "Taze Baklava Dünyası",
                subtitle: "Geleneksel Lezzet, Modern Sunum",
                description: "Antep fıstığıyla hazırlanan özel lezzetler",
                buttonText: "Baklavaları Keşfet",
                buttonLink: "/collection",
                buttonStyle: 'primary',
                image: "/uploads/default-slider-1.jpg", // Bu görseli yüklemeniz gerekecek
                overlayOpacity: 0,
                textColor: 'auto',
                order: 0,
                isActive: true
            },
            {
                template: 'split-right',
                title: "Özel Gün Paketleri",
                subtitle: "Sevdiklerinizi Mutlu Edin",
                description: "Düğün, bayram, yılbaşı özel paketler",
                buttonText: "Paketleri İncele",
                buttonLink: "/collection?category=Özel Paket",
                buttonStyle: 'primary',
                image: "/uploads/default-slider-2.jpg", // Bu görseli yüklemeniz gerekecek
                overlayOpacity: 0,
                textColor: 'auto',
                order: 1,
                isActive: true
            },
            {
                template: 'centered',
                title: "Aynı Gün Teslimat",
                subtitle: "Taze Kapınızda",
                description: "Siparişiniz 2 saat içinde kapınızda",
                buttonText: "Hemen Sipariş Ver",
                buttonLink: "/collection",
                buttonStyle: 'primary',
                image: "/uploads/default-slider-3.jpg", // Bu görseli yüklemeniz gerekecek
                overlayOpacity: 0,
                textColor: 'auto',
                order: 2,
                isActive: true
            }
        ];

        // Sliderları ekle
        const insertedSliders = await Slider.insertMany(defaultSliders);
        console.log(`✅ ${insertedSliders.length} adet default slider başarıyla eklendi!`);

        // Eklenen sliderları göster
        insertedSliders.forEach((slider, index) => {
            console.log(`\n📸 Slider ${index + 1}:`);
            console.log(`   Başlık: ${slider.title}`);
            console.log(`   ID: ${slider._id}`);
            console.log(`   Aktif: ${slider.isActive}`);
        });

        console.log('\n💡 Not: Görselleri yüklemek için admin panelden sliderları düzenleyip görsel yükleyebilirsiniz.');
        
        await mongoose.connection.close();
        console.log('\n✅ İşlem tamamlandı!');
    } catch (error) {
        console.error('❌ Hata:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Script'i çalıştır
addDefaultSliders();

