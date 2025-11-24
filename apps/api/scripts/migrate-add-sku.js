import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/ProductModel.js";
import Category from "../models/CategoryModel.js";

console.log("\n🔄 SKU MİGRASYONU BAŞLADI\n");
console.log("================================\n");

async function migrateSKU() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce");
        console.log("✓ MongoDB bağlantısı başarılı\n");

        // Get all categories
        const categories = await Category.find();
        console.log(`📋 Toplam ${categories.length} kategori bulundu\n`);

        // Create category ID to code mapping
        const categoryCodeMap = {};
        categories.forEach(cat => {
            const code = cat.name.substring(0, 3).toUpperCase();
            categoryCodeMap[cat._id.toString()] = code;
            console.log(`   ${cat.name} → ${code}`);
        });
        console.log("");

        // Get all products without SKU
        const products = await Product.find({ sku: { $exists: false } }).lean();
        console.log(`📦 SKU olmayan ${products.length} ürün bulundu\n`);

        if (products.length === 0) {
            console.log("✅ Tüm ürünlerde SKU mevcut!\n");
            await mongoose.connection.close();
            process.exit(0);
        }

        // Group products by category-size for counter management
        const skuCounters = {};

        let updated = 0;
        let failed = 0;

        for (const product of products) {
            try {
                // Get category code
                const categoryId = product.category.toString();
                const categoryCode = categoryCodeMap[categoryId] || 'PRD';

                // Get first size
                const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '000';

                // Generate counter key
                const counterKey = `${categoryCode}-${size}`;

                // Initialize counter if not exists
                if (!skuCounters[counterKey]) {
                    // Find last SKU with this pattern
                    const lastProduct = await Product.findOne({
                        sku: new RegExp(`^${categoryCode}-${size}-`)
                    })
                    .sort({ sku: -1 })
                    .select('sku')
                    .lean();

                    if (lastProduct && lastProduct.sku) {
                        const parts = lastProduct.sku.split('-');
                        if (parts.length === 3) {
                            skuCounters[counterKey] = parseInt(parts[2]);
                        } else {
                            skuCounters[counterKey] = 0;
                        }
                    } else {
                        skuCounters[counterKey] = 0;
                    }
                }

                // Increment counter
                skuCounters[counterKey]++;

                // Generate SKU
                const sku = `${categoryCode}-${size}-${String(skuCounters[counterKey]).padStart(3, '0')}`;

                // Update product
                await Product.updateOne(
                    { _id: product._id },
                    { $set: { sku: sku } }
                );

                console.log(`✓ "${product.name}" → ${sku}`);
                updated++;
            } catch (error) {
                console.error(`❌ HATA: "${product.name}" - ${error.message}`);
                failed++;
            }
        }

        console.log("\n================================");
        console.log("📊 MİGRASYON SONUÇLARI:");
        console.log(`   ✓ Başarılı: ${updated}`);
        console.log(`   ❌ Başarısız: ${failed}`);
        console.log(`   📦 Toplam: ${products.length}`);
        console.log("================================\n");

        console.log("✅ SKU MİGRASYONU TAMAMLANDI!\n");

    } catch (error) {
        console.error("\n❌ MİGRASYON HATASI:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

migrateSKU();
