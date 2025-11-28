import "dotenv/config";
import connectDB from "../config/mongodb.js";
import productModel from "../models/ProductModel.js";
import categoryModel from "../models/CategoryModel.js";
import logger from "../utils/logger.js";

const CATEGORY_CONFIG = {
  default: {
    description: "Başak Pastanesi ustalığıyla hazırlanır.",
    image: "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=800&q=80",
    stock: 24,
    freshType: "taze",
    packaging: "standart",
    giftWrap: false,
    allergens: "Gluten, Süt, Yumurta",
    ingredients: "Geleneksel tarifler, taze malzemeler",
    shelfLife: "2 gün",
    storageInfo: "Serin ve kuru yerde muhafaza ediniz.",
    labels: [],
  },
  "Pastalar Kategorisi": {
    description: "butik pasta koleksiyonumuzun favorilerinden biridir.",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    packaging: "özel",
    giftWrap: true,
    shelfLife: "2 gün",
    storageInfo: "Buzdolabında muhafaza ediniz.",
  },
  "Kahvaltılık & Sandviç Çeşitleri": {
    description: "sabah menüsünü tamamlayan taze sandviç ve eşlikçi ürünlerimizdendir.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    shelfLife: "1 gün",
    storageInfo: "Tüketene kadar soğuk ortamda saklayınız.",
  },
  "Donut Çeşitleri": {
    description: "el yapımı donut koleksiyonumuzda öne çıkan bir tatlıdır.",
    image: "https://images.unsplash.com/photo-1475856034135-5f98470f0a69?auto=format&fit=crop&w=800&q=80",
  },
  "Ekler Çeşitleri": {
    description: "özel kreması ve ince hamuruyla günlük taze hazırlanmaktadır.",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
  },
  "Kase Tatlı Çeşitleri": {
    description: "kase tatlı menümüzde sevilen seçeneklerden biridir.",
    image: "https://images.unsplash.com/photo-1501430654243-c934cec2e1f4?auto=format&fit=crop&w=800&q=80",
    packaging: "özel",
    storageInfo: "Buzdolabında muhafaza ediniz.",
  },
  "İzmir Bomba Çeşitleri": {
    description: "İzmir’in meşhur bombasının Başak Pastanesi yorumu.",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80",
    shelfLife: "2 gün",
  },
  "Tatlı (Adet&Dilim)": {
    description: "kısa molalarınıza eşlik eden adet veya dilim tatlılarımızdandır.",
    image: "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=800&q=80",
  },
  "Waffle Çeşitleri": {
    description: "özel soslar ve taze meyvelerle hazırlanmaktadır.",
    image: "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=800&q=80",
    shelfLife: "1 gün",
    storageInfo: "Sıcak tüketildiğinde en iyi deneyimi sunar.",
  },
  "Kiloluk Tatlı Çeşitleri": {
    description: "kiloyla satılan geleneksel tatlılarımızdan biridir.",
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80",
    freshType: "kuru",
    shelfLife: "5 gün",
    storageInfo: "Serin ve kuru ortamda muhafaza ediniz.",
  },
};

const RAW_PRODUCTS = {
  "Pastalar Kategorisi": [
    { name: "Profiterollü Pasta", price: 570 },
    { name: "Çilekli Çikolatalı Pasta", price: 570 },
    { name: "Meyveli Pasta", price: 570 },
    { name: "Çikolatalı Muzlu Pasta", price: 570 },
    { name: "Frambuazlı Pasta", price: 570 },
    { name: "Fıstıklı Pasta", price: 570 },
    { name: "Uğur Böceği Pasta", price: 570 },
    { name: "Tavşan Pasta", price: 570 },
    { name: "Antep Fıstıklı Grolet", price: 400 },
    { name: "Portakallı Pasta", price: 400 },
  ],
  "Kahvaltılık & Sandviç Çeşitleri": [
    { name: "Panini Mozzarella Sandviç", price: 240 },
    { name: "Panini Damla Jambon Sandviç", price: 305 },
    { name: "Panini Izgara Tavuklu Sandviç", price: 80 },
    { name: "Panini Salamlı Çeçil Peynirli Sandviç", price: 198 },
    { name: "Panini Hindi Füme Sandviç", price: 260 },
    { name: "Panini Sebzeli Vejetaryen Sandviç", price: 194 },
    { name: "Gurme Fiesta Sandviç", price: 315 },
    { name: "Gurme Beş Peynirli Sandviç", price: 240 },
    { name: "Kare Mozzarella Peynirli Sandviç", price: 220 },
    { name: "Boston Dana Jambon Bagel", price: 244 },
    { name: "Gurme İsli Çerkez Peynirli Sandviç", price: 280 },
    { name: "Las Vegas Üç Peynirli Bagel", price: 180 },
    { name: "Bagel Miami Roast Beef", price: 284 },
    { name: "Siyah Zeytin (1 porsiyon)", price: 30 },
    { name: "Yeşil Zeytin (1 porsiyon)", price: 30 },
    { name: "Bal (1 porsiyon)", price: 30 },
    { name: "Çilek Reçeli (1 porsiyon)", price: 30 },
    { name: "Beyaz Peynir (1 porsiyon)", price: 35 },
    { name: "Kaşar Peyniri (1 porsiyon)", price: 35 },
    { name: "Haşlanmış Yumurta (adet)", price: 22 },
  ],
  "Donut Çeşitleri": [
    { name: "Kit Kat Donut", price: 150 },
    { name: "Glamm White Donut", price: 130 },
    { name: "Karamel Rüyası Donut", price: 130 },
    { name: "Karamelim Donut", price: 130 },
    { name: "Limon Sever Donut", price: 130 },
    { name: "Çilek Sever Donut", price: 130 },
    { name: "Boston Cream Donut", price: 130 },
    { name: "Nutty Donut", price: 130 },
    { name: "Pink Glaze Donut", price: 130 },
    { name: "Marshmallow Donut", price: 130 },
    { name: "Glamm Pink Donut", price: 130 },
    { name: "Big Babol Donut", price: 130 },
    { name: "Çok Çok Çikolata Donut", price: 130 },
    { name: "Karaorman Donut", price: 130 },
    { name: "Mangolu Donut", price: 130 },
    { name: "Çikolata Fırtınası Donut", price: 130 },
    { name: "Orange Donut", price: 130 },
    { name: "Çilekli Berliner", price: 130 },
    { name: "Lotus Berliner", price: 130 },
    { name: "Çikolatalı Berliner", price: 130 },
  ],
  "Ekler Çeşitleri": [
    { name: "Antep Fıstıklı Ekler", price: 65 },
    { name: "Çilekli Ekler", price: 65 },
    { name: "Frambuazlı Ekler", price: 65 },
    { name: "Kahveli Ekler", price: 65 },
    { name: "Orman Meyveli Ekler", price: 65 },
    { name: "Karamelli Ekler", price: 65 },
    { name: "Çikolatalı Ekler", price: 65 },
    { name: "Limonlu Ekler", price: 65 },
    { name: "Lotus Bisküvili Ekler", price: 65 },
    { name: "Vişneli Ekler", price: 65 },
    { name: "Portakallı Ekler", price: 65 },
    { name: "Tahinli Ekler", price: 65 },
    { name: "Kit Kat Ekler", price: 65 },
    { name: "Böğürtlenli Ekler", price: 65 },
    { name: "Beyaz Çikolatalı Ekler", price: 65 },
    { name: "Bitter Çikolatalı Ekler", price: 65 },
    { name: "Ananaslı Ekler", price: 65 },
    { name: "Mangolu Ekler", price: 65 },
    { name: "Oreo Ekler", price: 65 },
    { name: "Muzlu Ekler", price: 65 },
    { name: "Fındıklı Ekler", price: 65 },
  ],
  "Kase Tatlı Çeşitleri": [
    { name: "Spoonful Tatlısı", price: 375 },
    { name: "Çilekli Mag", price: 240 },
    { name: "Oreo Bisküvili Mag", price: 240 },
    { name: "Orman Meyveli Mag", price: 240 },
    { name: "Frambuazlı Mag", price: 240 },
    { name: "Muzlu Mag", price: 240 },
    { name: "Antep Fıstıklı Mag", price: 240 },
    { name: "Profiterol Kasesi", price: 240 },
    { name: "Supangle", price: 240 },
    { name: "Vişneli Mag", price: 240 },
    { name: "Çikolatalı Mag", price: 240 },
    { name: "Karamelli Mag", price: 240 },
  ],
  "İzmir Bomba Çeşitleri": [
    { name: "Frambuazlı İzmir Bomba", price: 95 },
    { name: "Karamelli İzmir Bomba", price: 95 },
    { name: "Karaorman Meyveli İzmir Bomba", price: 95 },
    { name: "Lotus Bisküvili İzmir Bomba", price: 95 },
    { name: "Çikolatalı İzmir Bomba", price: 95 },
    { name: "Antep Fıstıklı İzmir Bomba", price: 95 },
  ],
  "Tatlı (Adet&Dilim)": [
    { name: "Meyveli Pasta (Dilim)", price: 250 },
    { name: "Çikolatalı Pasta (Dilim)", price: 250 },
    { name: "Karamelli Trileçe (Dilim)", price: 220 },
    { name: "Frambuazlı Trileçe (Dilim)", price: 220 },
    { name: "Büyük Ekler (Adet)", price: 100 },
    { name: "Brownie (Dilim)", price: 220 },
    { name: "Frambuazlı Cheesecake (Dilim)", price: 200 },
    { name: "Limonlu Cheesecake (Dilim)", price: 200 },
    { name: "Dökme Profiterol", price: 240 },
    { name: "Antep Fıstıklı Pasta (Adet)", price: 250 },
    { name: "Frambuazlı Pasta (Adet)", price: 250 },
    { name: "Çikolatalı Çilekli Pasta (Adet)", price: 250 },
    { name: "Krokanlı Pasta (Adet)", price: 250 },
  ],
  "Waffle Çeşitleri": [
    { name: "Klasik Waffle", price: 500 },
    { name: "Double Waffle", price: 660 },
    { name: "Lotus Waffle", price: 500 },
  ],
  "Kiloluk Tatlı Çeşitleri": [
    { name: "Cevizli Sarı Burma", price: 150 },
    { name: "Ankara Dürüm Baklava", price: 150 },
    { name: "Ev Baklavası", price: 150 },
    { name: "Klasik Cevizli Baklava", price: 150 },
    { name: "Cevizli Özel Baklava", price: 150 },
    { name: "Klasik Antep Baklava", price: 410 },
    { name: "Bol Fıstıklı Baklava", price: 435 },
    { name: "Antep Fıstıklı Baklava", price: 640 },
    { name: "Şambali Tatlısı (Kilo)", price: 125 },
    { name: "Antep Fıstıklı Şöbiyet", price: "391,50" },
    { name: "Cevizli Burma Kadayıf", price: "155,70" },
  ],
};

const parsePrice = (value) => {
  if (typeof value === "number") {
    return Math.round(value);
  }

  const normalized = value.replace(/[^0-9,.\-]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid price format: ${value}`);
  }

  return Math.round(parsed);
};

const generateKeywords = (name) => {
  return name
    .toLowerCase()
    .split(/[\s\-]+/)
    .filter((word) => word.length > 2)
    .slice(0, 6);
};

const buildDefaultProducts = () => {
  const now = Date.now();
  const products = [];

  Object.entries(RAW_PRODUCTS).forEach(([categoryName, items]) => {
    const config = {
      ...CATEGORY_CONFIG.default,
      ...(CATEGORY_CONFIG[categoryName] || {}),
    };

    items.forEach((item, index) => {
      const basePrice = parsePrice(item.price);
      const description = item.description || `${item.name} ${config.description}`;
      const metaDescription = description.length > 155 ? `${description.substring(0, 152)}...` : description;
      const rawMetaTitle = `${item.name} | ${categoryName} - Basak Pastanesi`;
      const metaTitle = rawMetaTitle.length > 60 ? `${rawMetaTitle.substring(0, 57)}...` : rawMetaTitle;

      products.push({
        name: item.name,
        description,
        category: categoryName,
        basePrice,
        image: item.image ? [item.image] : [config.image],
        labels: item.labels || config.labels,
        bestseller: Boolean(item.bestseller ?? false),
        stock: item.stock ?? config.stock,
        freshType: item.freshType || config.freshType,
        packaging: item.packaging || config.packaging,
        giftWrap: item.giftWrap ?? config.giftWrap,
        allergens: item.allergens || config.allergens,
        ingredients: item.ingredients || config.ingredients,
        shelfLife: item.shelfLife || config.shelfLife,
        storageInfo: item.storageInfo || config.storageInfo,
        keywords: item.keywords || generateKeywords(item.name),
        metaTitle,
        metaDescription,
        date: now - products.length - index,
        sizePrices: [],
        sizes: [],
        personCounts: [],
        weights: [],
        active: true,
      });
    });
  });

  return products;
};

const DEFAULT_PRODUCTS = buildDefaultProducts();

const seedProducts = async () => {
    try {
    console.log("🌱 Starting product seeding...");

        await connectDB();

        const existingCount = await productModel.countDocuments();

        if (existingCount > 0) {
            console.log(`⚠️  ${existingCount} products already exist in database`);
      console.log("Do you want to:");
      console.log("1. Skip seeding (keep existing)");
      console.log("2. Add only missing products");
      console.log("3. Clear and re-seed all products (⚠️  DESTRUCTIVE)");

      const option = process.argv[2] || "3";

      if (option === "1") {
        console.log("✅ Skipping seed - keeping existing products");
                process.exit(0);
      } else if (option === "3") {
        console.log("🗑️  Clearing existing products...");
                await productModel.deleteMany({});
        console.log("✅ Existing products cleared");
            }
        }

        const categories = await categoryModel.find();
        if (categories.length === 0) {
      console.error("❌ No categories found. Please run seedCategories.js first");
            process.exit(1);
        }

        console.log(`✅ Found ${categories.length} categories`);

        let addedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        for (const productData of DEFAULT_PRODUCTS) {
            const category = await categoryModel.findOne({ name: productData.category });

            if (!category) {
                console.log(`⚠️  Skipped: ${productData.name} (Category "${productData.category}" not found)`);
                skippedCount++;
                continue;
            }

            const existing = await productModel.findOne({
        name: { $regex: new RegExp(`^${productData.name}$`, "i") },
            });

            const finalProductData = {
                ...productData,
                category: category._id,
            };

            if (existing) {
                await productModel.findByIdAndUpdate(existing._id, finalProductData);
                updatedCount++;
                console.log(`✏️  Updated: ${productData.name}`);
            } else {
                const product = new productModel(finalProductData);
                await product.save();
                addedCount++;
                console.log(`✅ Added: ${productData.name} (${productData.category})`);
            }
        }

    console.log("\n🔄 Updating category product counts...");
        for (const category of categories) {
            await category.updateProductCount();
        }

    console.log("\n✨ Product seeding completed!");
        console.log(`📊 Summary:`);
        console.log(`   - Added: ${addedCount} products`);
        console.log(`   - Updated: ${updatedCount} products`);
        console.log(`   - Skipped: ${skippedCount} products`);
        console.log(`   - Total: ${await productModel.countDocuments()} products in database`);

    logger.info("Products seeded successfully", {
            added: addedCount,
            updated: updatedCount,
            skipped: skippedCount,
      total: await productModel.countDocuments(),
        });

        process.exit(0);
    } catch (error) {
    console.error("❌ Error seeding products:", error);
    logger.error("Product seeding failed", { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

const isMain = import.meta.url.endsWith("seedProducts.js");
if (isMain) {
    seedProducts();
}

export default seedProducts;
