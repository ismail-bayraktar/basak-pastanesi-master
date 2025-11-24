import "dotenv/config";
import connectDB from "../config/mongodb.js";
import productModel from "../models/ProductModel.js";
import categoryModel from "../models/CategoryModel.js";
import logger from "../utils/logger.js";

// Helper to generate sizePrices based on basePrice and sizes
const generateSizePrices = (basePrice, sizes) => {
    // Assuming basePrice is for the smallest size (e.g. 500g)
    // 500g = 1x
    // 1000g = 1.9x (bulk discount)
    // 1500g = 2.8x
    // 2000g = 3.6x

    if (!sizes || sizes.length === 0) return [];

    const smallestSize = Math.min(...sizes);

    return sizes.map(size => {
        let multiplier = size / smallestSize;

        // Apply discount for larger sizes
        if (multiplier > 1) {
            multiplier = multiplier * 0.95; // 5% discount per multiplier step roughly
        }

        // Round to nearest 10
        let price = Math.ceil((basePrice * multiplier) / 10) * 10;

        return {
            size: size,
            price: price
        };
    });
};

// Default products for Tulumbak
const DEFAULT_PRODUCTS = [
    // ========== TULUMBALAR ==========
    {
        name: "Tulumba Tatlısı",
        description: "Geleneksel tulumba tatlısı, hafif ve tatlı şerbetli. Günlük taze üretim.",
        category: "Tulumbalar",
        basePrice: 120,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["1-2", "3-4", "5-6", "8-10"],
        labels: [],
        bestseller: true,
        stock: 100,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Un, şeker, su, kabartma tozu, nişasta",
        allergens: "Gluten",
        shelfLife: "3 gün",
        storageInfo: "Oda sıcaklığında muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1518131678677-bc1cbd913b13?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        name: "Kaymaklı Tulumba",
        description: "Kaymak dolgulu özel tulumba tatlısı. İçi bol kaymaklı, dışı çıtır.",
        category: "Tulumbalar",
        basePrice: 220,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["1-2", "3-4", "5-6", "8-10"],
        labels: ["Öne Çıkan"],
        bestseller: false,
        stock: 50,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Un, şeker, kaymak, su, kabartma tozu",
        allergens: "Gluten, Süt",
        shelfLife: "2 gün",
        storageInfo: "Serin yerde muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1576749872115-d2b19dc0b0af?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        name: "Tahinli Fıstıklı Tulumba",
        description: "Tahin dolgulu, üzeri fıstık kaplı tulumba. Eşsiz bir lezzet deneyimi.",
        category: "Tulumbalar",
        basePrice: 220,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["1-2", "3-4", "5-6", "8-10"],
        labels: ["Yeni"],
        bestseller: false,
        stock: 40,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Un, şeker, tahin, Antep fıstığı, su",
        allergens: "Gluten, Susam, Sert Kabuklu Yemiş",
        shelfLife: "3 gün",
        storageInfo: "Oda sıcaklığında muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        name: "Lotuslu Tulumba Tatlısı",
        description: "Lotus dolgulu ve lotus kırığı kaplı özel tulumba. Modern lezzet.",
        category: "Tulumbalar",
        basePrice: 220,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["1-2", "3-4", "5-6", "8-10"],
        labels: ["Yeni", "Öne Çıkan"],
        bestseller: true,
        stock: 30,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Un, şeker, Lotus bisküvisi, karamel, su",
        allergens: "Gluten, Süt",
        shelfLife: "3 gün",
        storageInfo: "Oda sıcaklığında muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80"
        ]
    },

    // ========== SÜTLÜ TATILAR ==========
    {
        name: "Soğuk Baklava (Cevizli)",
        description: "Cevizli soğuk baklava, sütlü ve hafif. Yaz aylarının vazgeçilmezi.",
        category: "Sütlü Tatlılar",
        basePrice: 290,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["2-3", "4-5", "6-8", "10-12"],
        labels: [],
        bestseller: true,
        stock: 50,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Yufka, ceviz, süt, şeker, tereyağı",
        allergens: "Gluten, Süt, Sert Kabuklu Yemiş",
        shelfLife: "2 gün",
        storageInfo: "Buzdolabında muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        name: "Soğuk Baklava (Fıstıklı)",
        description: "Antep fıstıklı soğuk baklava, premium lezzet. Bol fıstıklı.",
        category: "Sütlü Tatlılar",
        basePrice: 390,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["2-3", "4-5", "6-8", "10-12"],
        labels: ["Öne Çıkan"],
        bestseller: true,
        stock: 40,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Yufka, Antep fıstığı, süt, şeker, tereyağı",
        allergens: "Gluten, Süt, Sert Kabuklu Yemiş",
        shelfLife: "2 gün",
        storageInfo: "Buzdolabında muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        name: "Sade Maraş Dondurma",
        description: "Geleneksel sade Maraş dondurması. Keçi sütü ile yapılmıştır.",
        category: "Sütlü Tatlılar",
        basePrice: 150,
        sizes: [250, 500, 1000, 1500],
        weights: [250, 500, 1000, 1500],
        personCounts: ["1-2", "3-4", "6-8", "10-12"],
        labels: [],
        bestseller: true,
        stock: 100,
        freshType: "taze",
        packaging: "özel",
        date: Date.now(),
        giftWrap: false,
        ingredients: "Süt, şeker, salep, sakız",
        allergens: "Süt",
        shelfLife: "30 gün",
        storageInfo: "Dondurucuda muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80"
        ]
    },

    // ========== ŞERBETLİ TATILAR ==========
    {
        name: "Cevizli Özel Baklava",
        description: "Küçük dilim, bol cevizli özel baklava. İnce yufka, bol malzeme.",
        category: "Şerbetli Tatlılar",
        basePrice: 250,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["2-3", "4-6", "8-10", "12+"],
        labels: [],
        bestseller: true,
        stock: 100,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Yufka, ceviz, şeker, tereyağı, su",
        allergens: "Gluten, Süt, Sert Kabuklu Yemiş",
        shelfLife: "7 gün",
        storageInfo: "Oda sıcaklığında muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1551024601-564d6d6744f1?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        name: "Fıstıklı Kaymaklı Midye Baklava",
        description: "Antep fıstığı ve kaymak dolgulu midye baklava. Görsel şölen.",
        category: "Şerbetli Tatlılar",
        basePrice: 390,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["2-3", "4-6", "8-10", "12+"],
        labels: ["Öne Çıkan"],
        bestseller: true,
        stock: 50,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Yufka, Antep fıstığı, kaymak, şeker, tereyağı",
        allergens: "Gluten, Süt, Sert Kabuklu Yemiş",
        shelfLife: "5 gün",
        storageInfo: "Serin yerde muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        name: "Diyarbakır Burma Kadayıf (Cevizli)",
        description: "Bol cevizli Diyarbakır usulü burma kadayıf. Çıtır çıtır.",
        category: "Şerbetli Tatlılar",
        basePrice: 200,
        sizes: [500, 1000, 1500, 2000],
        weights: [500, 1000, 1500, 2000],
        personCounts: ["2-3", "4-6", "8-10", "12+"],
        labels: ["Yeni"],
        bestseller: false,
        stock: 60,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: true,
        ingredients: "Kadayıf, ceviz, şeker, tereyağı, su",
        allergens: "Gluten, Süt, Sert Kabuklu Yemiş",
        shelfLife: "5 gün",
        storageInfo: "Oda sıcaklığında muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80"
        ]
    },
    {
        name: "Şambali Tatlısı",
        description: "Geleneksel şambali, adet olarak servis edilmektedir. İzmir'in meşhur tatlısı.",
        category: "Şerbetli Tatlılar",
        basePrice: 50,
        sizes: [1, 3, 6, 12, 24],
        weights: [80, 240, 480, 960, 1920],
        personCounts: ["1", "3", "6", "12", "24"],
        labels: [],
        bestseller: true,
        stock: 150,
        freshType: "taze",
        packaging: "standart",
        date: Date.now(),
        giftWrap: false,
        ingredients: "İrmik, yoğurt, şeker, tereyağı",
        allergens: "Süt, Gluten",
        shelfLife: "5 gün",
        storageInfo: "Oda sıcaklığında muhafaza edilmelidir",
        image: [
            "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
        ]
    }
];

const seedProducts = async () => {
    try {
        console.log('🌱 Starting product seeding...');

        // Connect to MongoDB
        await connectDB();

        // Check if products already exist
        const existingCount = await productModel.countDocuments();

        if (existingCount > 0) {
            console.log(`⚠️  ${existingCount} products already exist in database`);
            console.log('Do you want to:');
            console.log('1. Skip seeding (keep existing)');
            console.log('2. Add only missing products');
            console.log('3. Clear and re-seed all products (⚠️  DESTRUCTIVE)');

            // For automated seeding, default to option 3 (CLEAR AND RE-SEED) to ensure standardization
            const option = process.argv[2] || '3';

            if (option === '1') {
                console.log('✅ Skipping seed - keeping existing products');
                process.exit(0);
            } else if (option === '3') {
                console.log('🗑️  Clearing existing products...');
                await productModel.deleteMany({});
                console.log('✅ Existing products cleared');
            }
        }

        // Verify categories exist
        const categories = await categoryModel.find();
        if (categories.length === 0) {
            console.error('❌ No categories found. Please run seedCategories.js first');
            process.exit(1);
        }

        console.log(`✅ Found ${categories.length} categories`);

        // Insert or update default products
        let addedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        for (const productData of DEFAULT_PRODUCTS) {
            // Verify category exists
            const category = await categoryModel.findOne({ name: productData.category });

            if (!category) {
                console.log(`⚠️  Skipped: ${productData.name} (Category "${productData.category}" not found)`);
                skippedCount++;
                continue;
            }

            // Generate sizePrices
            const sizePrices = generateSizePrices(productData.basePrice, productData.sizes);

            const existing = await productModel.findOne({
                name: { $regex: new RegExp(`^${productData.name}$`, 'i') }
            });

            const finalProductData = {
                ...productData,
                category: category._id,
                sizePrices: sizePrices
            };

            if (existing) {
                // Update if exists
                await productModel.findByIdAndUpdate(existing._id, finalProductData);
                updatedCount++;
                console.log(`✏️  Updated: ${productData.name}`);
            } else {
                // Create if doesn't exist
                const product = new productModel(finalProductData);
                await product.save();
                addedCount++;
                console.log(`✅ Added: ${productData.name} (${productData.category})`);
            }
        }

        // Update category product counts
        console.log('\n🔄 Updating category product counts...');
        for (const category of categories) {
            await category.updateProductCount();
        }

        console.log('\n✨ Product seeding completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Added: ${addedCount} products`);
        console.log(`   - Updated: ${updatedCount} products`);
        console.log(`   - Skipped: ${skippedCount} products`);
        console.log(`   - Total: ${await productModel.countDocuments()} products in database`);

        logger.info('Products seeded successfully', {
            added: addedCount,
            updated: updatedCount,
            skipped: skippedCount,
            total: await productModel.countDocuments()
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        logger.error('Product seeding failed', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

// Run seed if this script is executed directly
const isMain = import.meta.url.endsWith('seedProducts.js');
if (isMain) {
    seedProducts();
}

export default seedProducts;
