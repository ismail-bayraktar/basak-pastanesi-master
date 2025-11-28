import "dotenv/config";
import connectDB from "../config/mongodb.js";
import categoryModel from "../models/CategoryModel.js";
import logger from "../utils/logger.js";

// Default categories for Basak Pastanesi (based on provided catalog)
const DEFAULT_CATEGORIES = [
  {
    name: "Pastalar Kategorisi",
    description: "Özel günler ve günlük tüketime uygun taze pasta çeşitleri",
    active: true,
    image: null,
    metaTitle: "Pastalar | Basak Pastanesi",
    metaDescription: "Profiterollü, çilekli, frambuazlı ve özel tasarım pastalar. Başak Pastanesi ustalığıyla günlük taze üretim.",
    keywords: ["pasta", "özel gün pastası", "çilekli pasta", "profiterollü pasta"],
    order: 1,
  },
  {
    name: "Kahvaltılık & Sandviç Çeşitleri",
    description: "Gurme sandviçler, paniniler ve kahvaltı eşlikçileri",
    active: true,
    image: null,
    metaTitle: "Kahvaltılık ve Sandviç Çeşitleri | Basak Pastanesi",
    metaDescription: "Mozzarellalı paninilerden gurme bagellere kadar taze sandviç çeşitleri ve kahvaltı tabakları.",
    keywords: ["sandviç", "panini", "kahvaltı", "bagel"],
    order: 2,
  },
  {
    name: "Donut Çeşitleri",
    description: "Renkli donutlar, Berliner ve tatlı atıştırmalıklar",
    active: true,
    image: null,
    metaTitle: "Donut Çeşitleri | Basak Pastanesi",
    metaDescription: "Kit Kat, karamelli, çilekli donut ve Berliner çeşitleri. Günün her anına yakışan tatlı atıştırmalıklar.",
    keywords: ["donut", "berliner", "tatlı atıştırmalık", "çilekli donut"],
    order: 3,
  },
  {
    name: "Ekler Çeşitleri",
    description: "Klasik ve aromalı ekler tatlıları",
    active: true,
    image: null,
    metaTitle: "Ekler Çeşitleri | Basak Pastanesi",
    metaDescription: "Antep fıstıklı, çilekli, limonlu ve Lotus bisküvili ekler tatlıları taze olarak hazırlanır.",
    keywords: ["ekler", "antep fıstıklı ekler", "lotus ekler"],
    order: 4,
  },
  {
    name: "Kase Tatlı Çeşitleri",
    description: "Mag, spoonful ve kase tatlı seçenekleri",
    active: true,
    image: null,
    metaTitle: "Kase Tatlılar | Basak Pastanesi",
    metaDescription: "Çilekli, Oreolu, muzlu mag ve klasik profiterol gibi kase tatlı çeşitleri.",
    keywords: ["mag", "kase tatlı", "profiterol", "supangle"],
    order: 5,
  },
  {
    name: "İzmir Bomba Çeşitleri",
    description: "Frambuazlı, karamelli ve fıstıklı İzmir bomba tatlıları",
    active: true,
    image: null,
    metaTitle: "İzmir Bomba Çeşitleri | Basak Pastanesi",
    metaDescription: "İzmir’in meşhur bomba tatlısı; frambuazlı, karamelli, Lotuslu ve fıstıklı seçeneklerle.",
    keywords: ["izmir bomba", "lotus bomba", "frambuazlı bomba"],
    order: 6,
  },
  {
    name: "Tatlı (Adet&Dilim)",
    description: "Dilim veya adet satılan cheesecake, brownie ve pasta dilimleri",
    active: true,
    image: null,
    metaTitle: "Adet ve Dilim Tatlılar | Basak Pastanesi",
    metaDescription: "Cheesecake dilimleri, brownie, trileçe ve adet pasta seçenekleri.",
    keywords: ["cheesecake", "trileçe", "brownie", "dilim tatlı"],
    order: 7,
  },
  {
    name: "Waffle Çeşitleri",
    description: "Klasik, Lotus ve double waffle seçenekleri",
    active: true,
    image: null,
    metaTitle: "Waffle Çeşitleri | Basak Pastanesi",
    metaDescription: "Klasik waffle, Lotus waffle ve double waffle seçenekleriyle kahve molalarınızı tatlandırın.",
    keywords: ["waffle", "lotus waffle", "double waffle"],
    order: 8,
  },
  {
    name: "Kiloluk Tatlı Çeşitleri",
    description: "Baklava ve kadayıf gibi kilo ile satılan geleneksel tatlılar",
    active: true,
    image: null,
    metaTitle: "Kiloluk Tatlılar | Basak Pastanesi",
    metaDescription: "Cevizli sarı burma, ev baklavası, Ankara dürüm ve Antep fıstıklı şöbiyet gibi kilo ile satılan tatlılar.",
    keywords: ["kiloluk tatlı", "baklava", "kadayıf", "şöbiyet"],
    order: 9,
  },
];

const seedCategories = async () => {
  try {
    console.log("🌱 Starting category seeding...");

    // Connect to MongoDB
    await connectDB();

    // Check if categories already exist
    const existingCount = await categoryModel.countDocuments();

    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} categories already exist in database`);
      console.log("Do you want to:");
      console.log("1. Skip seeding (keep existing)");
      console.log("2. Add only missing categories");
      console.log("3. Clear and re-seed all categories (⚠️  DESTRUCTIVE)");

      // For automated seeding, default to option 2 (add missing only)
      const option = process.argv[2] || "2";

      if (option === "1") {
        console.log("✅ Skipping seed - keeping existing categories");
        process.exit(0);
      } else if (option === "3") {
        console.log("🗑️  Clearing existing categories...");
        await categoryModel.deleteMany({});
        console.log("✅ Existing categories cleared");
      }
    }

    // Insert or update default categories
    let addedCount = 0;
    let updatedCount = 0;

    for (const categoryData of DEFAULT_CATEGORIES) {
      const existing = await categoryModel.findOne({
        name: { $regex: new RegExp(`^${categoryData.name}$`, "i") },
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

    console.log("\n✨ Category seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Added: ${addedCount} categories`);
    console.log(`   - Updated: ${updatedCount} categories`);
    console.log(`   - Total: ${await categoryModel.countDocuments()} categories in database`);

    // List all categories
    const allCategories = await categoryModel.find().sort({ order: 1 });
    console.log("\n📋 Current categories:");
    allCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.slug}) - ${cat.active ? "Active" : "Inactive"}`);
    });

    logger.info("Categories seeded successfully", {
      added: addedCount,
      updated: updatedCount,
      total: allCategories.length,
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    logger.error("Category seeding failed", { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Run seed if this script is executed directly
const isMain = import.meta.url.endsWith("seedCategories.js");
if (isMain) {
  seedCategories();
}

export default seedCategories;
