import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/ProductModel.js";
import Category from "../models/CategoryModel.js";

console.log("\n🔄 KATEGORI MİGRASYONU BAŞLADI\n");
console.log("================================\n");

async function migrateCategories() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce");
        console.log("✓ MongoDB bağlantısı başarılı\n");

        // Get all categories
        const categories = await Category.find();
        console.log(`📋 Toplam ${categories.length} kategori bulundu\n`);

        // Create category name to ObjectId mapping
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
            console.log(`   ${cat.name} → ${cat._id}`);
        });
        console.log("");

        // Get all products with string category
        const products = await Product.find({}).lean();
        console.log(`📦 Toplam ${products.length} ürün bulundu\n`);

        let updated = 0;
        let failed = 0;
        let skipped = 0;

        for (const product of products) {
            try {
                // Check if category is already ObjectId
                if (product.category instanceof mongoose.Types.ObjectId ||
                    mongoose.Types.ObjectId.isValid(product.category)) {
                    console.log(`⏭️  Atlandı: "${product.name}" - Zaten ObjectId`);
                    skipped++;
                    continue;
                }

                // Find matching category ObjectId
                const categoryName = product.category;
                const categoryId = categoryMap[categoryName];

                if (!categoryId) {
                    console.log(`❌ HATA: "${product.name}" - Kategori bulunamadı: "${categoryName}"`);
                    failed++;
                    continue;
                }

                // Update product with ObjectId
                await Product.updateOne(
                    { _id: product._id },
                    { $set: { category: categoryId } }
                );

                console.log(`✓ Güncellendi: "${product.name}" - "${categoryName}" → ${categoryId}`);
                updated++;
            } catch (error) {
                console.error(`❌ HATA: "${product.name}" - ${error.message}`);
                failed++;
            }
        }

        console.log("\n================================");
        console.log("📊 MİGRASYON SONUÇLARI:");
        console.log(`   ✓ Başarılı: ${updated}`);
        console.log(`   ⏭️  Atlandı: ${skipped}`);
        console.log(`   ❌ Başarısız: ${failed}`);
        console.log(`   📦 Toplam: ${products.length}`);
        console.log("================================\n");

        // Update product counts for all categories
        console.log("📊 Kategori ürün sayıları güncelleniyor...\n");
        for (const category of categories) {
            await category.updateProductCount();
            console.log(`   ${category.name}: ${category.productCount} ürün`);
        }

        console.log("\n✅ MİGRASYON TAMAMLANDI!\n");

    } catch (error) {
        console.error("\n❌ MİGRASYON HATASI:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

migrateCategories();
