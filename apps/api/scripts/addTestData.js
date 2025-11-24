import mongoose from 'mongoose';
import Product from '../models/ProductModel.js';
import dotenv from 'dotenv';

dotenv.config();

const addTestData = async () => {
    try {
        const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const hasDbInUri = /\/(\w|%|-)+/.test(baseUri);
        const mongoUri = hasDbInUri ? baseUri : `${baseUri}/ecommerce`;
        
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");
        
        // Önce mevcut test ürünlerini temizle
        await Product.deleteMany({ name: /Test Ürün/ });
        
        // Test ürünleri ekle
        const testProducts = [
            {
                name: "Fıstıklı Baklava",
                category: "baklava",
                description: "Taze ve lezzetli geleneksel baklava",
                basePrice: 150,
                image: ["/uploads/test-product-1.png"],
                sizes: [250, 500],
                weights: [250, 500],
                personCounts: ["2-3", "5-6"],
                freshType: "taze",
                packaging: "standart",
                bestseller: true,
                date: Date.now(),
                sizePrices: [{ size: 250, price: 150 }, { size: 500, price: 280 }],
                stock: 50,
                allergens: "Glüten, fıstık",
                ingredients: "Un, tereyağı, fıstık, şeker, nişasta",
                shelfLife: "7 gün",
                storageInfo: "Oda sıcaklığında saklayın"
            },
            {
                name: "Cevizli Sütlü Nuriye", 
                category: "baklava",
                description: "Cevizle hazırlanan özel baklava",
                basePrice: 180,
                image: ["/uploads/test-product-2.png"],
                sizes: [500],
                weights: [500],
                personCounts: ["4-5"],
                freshType: "taze",
                packaging: "özel",
                bestseller: true,
                date: Date.now(),
                sizePrices: [{ size: 500, price: 180 }],
                stock: 30,
                allergens: "Glüten, ceviz",
                ingredients: "Un, tereyağı, ceviz, süt, şeker",
                shelfLife: "5 gün",
                storageInfo: "Buzdolabında saklayın"
            }
        ];
        
        await Product.insertMany(testProducts);
        console.log('✅ Test ürünleri başarıyla eklendi!');
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

addTestData();

