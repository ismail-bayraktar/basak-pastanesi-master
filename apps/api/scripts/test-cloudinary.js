import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

console.log("\n🧪 CLOUDINARY ENTEGRASYON TESTİ\n");
console.log("================================\n");

// Test 1: Configuration Check
console.log("📋 Test 1: Cloudinary Konfigürasyonu");
console.log("----------------------------------");
console.log(`Cloud Name: ${process.env.CLOUDINARY_NAME}`);
console.log(`API Key: ${process.env.CLOUDINARY_API_KEY ? '✓ Tanımlı' : '✗ Tanımsız'}`);
console.log(`API Secret: ${process.env.CLOUDINARY_SECRET_KEY ? '✓ Tanımlı' : '✗ Tanımsız'}`);
console.log("");

// Test 2: Connection Test
console.log("📋 Test 2: Cloudinary Bağlantı Testi");
console.log("----------------------------------");

try {
    const result = await cloudinary.api.ping();
    console.log("✓ Cloudinary'e bağlantı başarılı!");
    console.log(`Status: ${result.status}\n`);
} catch (error) {
    console.error("✗ Cloudinary bağlantı hatası:", error.message);
    console.error("\n");
    process.exit(1);
}

// Test 3: Test Image Upload
console.log("📋 Test 3: Test Görsel Yükleme");
console.log("----------------------------------");

// Create a simple test image path (use an existing image from uploads or create a placeholder)
const uploadsDir = path.join(__dirname, '../uploads');
const testImagePath = fs.existsSync(uploadsDir) && fs.readdirSync(uploadsDir).length > 0
    ? path.join(uploadsDir, fs.readdirSync(uploadsDir).find(f => f.match(/\.(jpg|jpeg|png|gif)$/i)))
    : null;

if (!testImagePath) {
    console.log("⚠ Uploads klasöründe test için görsel bulunamadı.");
    console.log("Manuel upload testi için bir görsel yükleyin.\n");
} else {
    try {
        console.log(`Test görseli: ${path.basename(testImagePath)}`);

        const uploadResult = await cloudinary.uploader.upload(testImagePath, {
            folder: 'tulumbak/test',
            resource_type: 'auto',
            transformation: [
                { width: 800, height: 800, crop: 'limit', quality: 'auto' }
            ]
        });

        console.log("✓ Görsel başarıyla yüklendi!");
        console.log(`Public ID: ${uploadResult.public_id}`);
        console.log(`URL: ${uploadResult.secure_url}`);
        console.log(`Format: ${uploadResult.format}`);
        console.log(`Width: ${uploadResult.width}px`);
        console.log(`Height: ${uploadResult.height}px`);
        console.log(`Size: ${(uploadResult.bytes / 1024).toFixed(2)} KB\n`);

        // Test 4: Delete Test Image
        console.log("📋 Test 4: Test Görseli Silme");
        console.log("----------------------------------");

        const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log(`✓ Test görseli silindi: ${deleteResult.result}\n`);

    } catch (error) {
        console.error("✗ Upload hatası:", error.message);
        console.error("\n");
    }
}

// Test 5: API Quota Check
console.log("📋 Test 5: API Kullanım Bilgisi");
console.log("----------------------------------");

try {
    const usage = await cloudinary.api.usage();
    console.log(`Plan: ${usage.plan || 'Free'}`);
    console.log(`Kullanılan Depolama: ${(usage.storage.usage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Toplam Dosya: ${usage.resources || 'N/A'}`);
    console.log(`Aylık Bandwidth: ${usage.bandwidth ? (usage.bandwidth.usage / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`);
    console.log("\n");
} catch (error) {
    console.log("⚠ Kullanım bilgisi alınamadı (Free plan kısıtlaması olabilir)\n");
}

console.log("================================");
console.log("✓ TÜM TESTLER TAMAMLANDI");
console.log("================================\n");
