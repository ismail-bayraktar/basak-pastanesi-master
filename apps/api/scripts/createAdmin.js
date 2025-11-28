import mongoose from "mongoose";
import bcrypt from "bcrypt";
import adminModel from "../models/AdminModel.js";
import "dotenv/config";

const createAdmin = async () => {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGODB_URI ||
      `mongodb://${process.env.MONGO_USERNAME || 'root'}:${process.env.MONGO_PASSWORD || 'example'}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DB || 'ecommerce'}?authSource=${process.env.MONGO_AUTHSOURCE || 'admin'}`;

    console.log("MongoDB'ye bağlanılıyor...");
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB bağlantısı başarılı!");

    // Admin bilgileri
    const adminEmail = "admin@basakpastanesi.com";
    const adminPassword = "Basak2025!";
    const adminName = "Basak Pastanesi Admin";

    // Mevcut admin kontrolü
    const existingAdmin = await adminModel.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("⚠️  Bu email ile bir admin zaten mevcut!");
      console.log("Mevcut admin bilgileri:");
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Rol: ${existingAdmin.role}`);
      console.log(`Aktif: ${existingAdmin.isActive}`);

      // Şifreyi güncelle
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.isActive = true;
      existingAdmin.role = 'super_admin';
      await existingAdmin.save();
      console.log("✅ Admin şifresi güncellendi!");
      await mongoose.disconnect();
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Tüm yetkileri ver
    const allPermissions = [
      'products:create',
      'products:read',
      'products:update',
      'products:delete',
      'orders:read',
      'orders:update',
      'users:read',
      'users:update',
      'coupons:create',
      'coupons:read',
      'coupons:update',
      'coupons:delete',
      'settings:read',
      'settings:update',
      'reports:read',
      'courier:read',
      'courier:update'
    ];

    // Yeni admin oluştur
    const newAdmin = new adminModel({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'super_admin',
      permissions: allPermissions,
      isActive: true
    });

    await newAdmin.save();

    console.log("\n✅ Admin hesabı başarıyla oluşturuldu!");
    console.log("\n📋 Admin Bilgileri:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Şifre: ${adminPassword}`);
    console.log(`   Rol: super_admin`);
    console.log(`   Yetkiler: Tüm yetkilere sahip`);
    console.log("\n⚠️  GÜVENLİK UYARISI: Şifre güvenlik nedeniyle loglanmıyor. İlk girişten sonra mutlaka değiştirin!");

    await mongoose.disconnect();
    console.log("\n✅ İşlem tamamlandı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();

