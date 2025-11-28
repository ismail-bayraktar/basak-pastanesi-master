import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "../models/UserModel.js";
import "dotenv/config";

const createTestUser = async () => {
  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGODB_URI ||
      `mongodb://${process.env.MONGO_USERNAME || 'root'}:${process.env.MONGO_PASSWORD || 'example'}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DB || 'ecommerce'}?authSource=${process.env.MONGO_AUTHSOURCE || 'admin'}`;

    console.log("MongoDB'ye bağlanılıyor...");
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB bağlantısı başarılı!");

    // Test Kullanıcı Bilgileri
    const userEmail = "musteri@basakpastanesi.com";
    const userPassword = "Musteri123!";
    const userName = "Test Müşterisi";
    const userPhone = "05551234567";

    // Mevcut kullanıcı kontrolü
    const existingUser = await userModel.findOne({ email: userEmail });
    if (existingUser) {
      console.log("⚠️  Bu email ile bir kullanıcı zaten mevcut!");
      
      // Şifreyi güncelle
      const hashedPassword = await bcrypt.hash(userPassword, 10);
      existingUser.password = hashedPassword;
      existingUser.name = userName;
      existingUser.phoneNumber = userPhone;
      // existingUser.isVerified = true; // Eğer email doğrulama varsa
      await existingUser.save();
      
      console.log("✅ Test kullanıcısı bilgileri güncellendi!");
      await mongoose.disconnect();
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Yeni kullanıcı oluştur
    const newUser = new userModel({
      name: userName,
      email: userEmail,
      password: hashedPassword,
      phoneNumber: userPhone,
      role: 'user',
      // isVerified: true
    });

    await newUser.save();

    console.log("\n✅ Test kullanıcısı başarıyla oluşturuldu!");
    console.log("\n📋 Kullanıcı Bilgileri:");
    console.log(`   Email: ${userEmail}`);
    console.log(`   Şifre: ${userPassword}`);
    console.log(`   Ad: ${userName}`);
    console.log(`   Tel: ${userPhone}`);

    await mongoose.disconnect();
    console.log("\n✅ İşlem tamamlandı!");

  } catch (error) {
    console.error("❌ Hata:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createTestUser();

