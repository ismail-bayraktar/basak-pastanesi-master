import "dotenv/config";
import connectDB from "../config/mongodb.js";
import categoryModel from "../models/CategoryModel.js";
import logger from "../utils/logger.js";

// Default categories for Tulumbak
const DEFAULT_CATEGORIES = [
    {
        name: "Tulumbalar",
        description: "Geleneksel ve özel dolgulu tulumba tatlıları",
        active: true,
        image: null,
        metaTitle: "Tulumba Tatlısı Çeşitleri | Tulumbak",
        metaDescription: "Kaymaklı, tahinli, fıstıklı ve Lotuslu özel tulumba tatlıları. Geleneksel lezzetleri modern dokunuşlarla sunuyoruz.",
        keywords: ["tulumba", "tulumba tatlısı", "kaymaklı tulumba", "özel tulumba"],
        order: 1
    },
    {
        name: "Sütlü Tatlılar",
        description: "Soğuk baklava, Maraş dondurması ve sütlü lezzetler",
        active: true,
        image: null,
        metaTitle: "Sütlü Tatlılar - Soğuk Baklava & Dondurma | Tulumbak",
        metaDescription: "Cevizli ve fıstıklı soğuk baklava, geleneksel Maraş dondurması çeşitleri. Sütlü tatlıların en lezzetlileri burada.",
        keywords: ["sütlü tatlı", "soğuk baklava", "maraş dondurması", "dondurma"],
        order: 2
    },
    {
        name: "Şerbetli Tatlılar",
        description: "Baklava, kadayıf, şambali ve geleneksel şerbetli tatlılar",
        active: true,
        image: null,
        metaTitle: "Şerbetli Tatlılar - Baklava, Kadayıf, Halep | Tulumbak",
        metaDescription: "Cevizli ve fıstıklı baklava, burma kadayıf, şambali, Halep tatlısı ve daha fazlası. Geleneksel şerbetli tatlıların vazgeçilmez adresi.",
        keywords: ["şerbetli tatlı", "baklava", "kadayıf", "şambali", "halep tatlısı"],
        order: 3
    },
    {
        name: "En Çok Tercih Edilenler",
        description: "Müşterilerimizin favorisi olan popüler tatlılar",
        active: true,
        image: null,
        metaTitle: "En Çok Tercih Edilen Tatlılar | Tulumbak",
        metaDescription: "Müşterilerimizin en sevdiği ve en çok sipariş verdiği tatlılar. Bestseller tatlı çeşitlerimizi keşfedin.",
        keywords: ["popüler tatlılar", "bestseller", "en çok satanlar", "favori tatlılar"],
        order: 4
    },
    {
        name: "İndirim",
        description: "Kampanyalı ve indirimli tatlılar",
        active: true,
        image: null,
        metaTitle: "İndirimli Tatlılar - Kampanyalar | Tulumbak",
        metaDescription: "Uygun fiyatlı tatlılar, kampanyalı ürünler ve özel indirimler. Kaliteli tatlıları avantajlı fiyatlarla sipariş edin.",
        keywords: ["indirimli tatlı", "kampanya", "fırsat ürünleri", "tatlı indirimleri"],
        order: 5
    }
];

const seedCategories = async () => {
    try {
        console.log('🌱 Starting category seeding...');

        // Connect to MongoDB
        await connectDB();

        // Check if categories already exist
        const existingCount = await categoryModel.countDocuments();

        if (existingCount > 0) {
            console.log(`⚠️  ${existingCount} categories already exist in database`);
            console.log('Do you want to:');
            console.log('1. Skip seeding (keep existing)');
            console.log('2. Add only missing categories');
            console.log('3. Clear and re-seed all categories (⚠️  DESTRUCTIVE)');

            // For automated seeding, default to option 2 (add missing only)
            const option = process.argv[2] || '2';

            if (option === '1') {
                console.log('✅ Skipping seed - keeping existing categories');
                process.exit(0);
            } else if (option === '3') {
                console.log('🗑️  Clearing existing categories...');
                await categoryModel.deleteMany({});
                console.log('✅ Existing categories cleared');
            }
        }

        // Insert or update default categories
        let addedCount = 0;
        let updatedCount = 0;

        for (const categoryData of DEFAULT_CATEGORIES) {
            const existing = await categoryModel.findOne({
                name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') }
            });

            if (existing) {
                // Update if exists
                await categoryModel.findByIdAndUpdate(existing._id, categoryData);
                updatedCount++;
                console.log(`✏️  Updated: ${categoryData.name}`);
            } else {
                // Create if doesn't exist
                const category = new categoryModel(categoryData);
                await category.save();
                addedCount++;
                console.log(`✅ Added: ${categoryData.name} (${category.slug})`);
            }
        }

        console.log('\n✨ Category seeding completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Added: ${addedCount} categories`);
        console.log(`   - Updated: ${updatedCount} categories`);
        console.log(`   - Total: ${await categoryModel.countDocuments()} categories in database`);

        // List all categories
        const allCategories = await categoryModel.find().sort({ order: 1 });
        console.log('\n📋 Current categories:');
        allCategories.forEach((cat, index) => {
            console.log(`   ${index + 1}. ${cat.name} (${cat.slug}) - ${cat.active ? 'Active' : 'Inactive'}`);
        });

        logger.info('Categories seeded successfully', {
            added: addedCount,
            updated: updatedCount,
            total: allCategories.length
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        logger.error('Category seeding failed', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

// Run seed if this script is executed directly
const isMain = import.meta.url.endsWith('seedCategories.js');
if (isMain) {
    seedCategories();
}

export default seedCategories;
