/**
 * Migration Script: Move local /uploads images to Cloudinary
 *
 * This script:
 * 1. Finds all products with /uploads/... image URLs
 * 2. Downloads images from local storage (if exists) or skips
 * 3. Uploads to Cloudinary
 * 4. Updates product.image array with new Cloudinary URLs
 * 5. Creates Media records for tracking
 *
 * Usage:
 *   node scripts/migrateImagesToCloudinary.js
 *   node scripts/migrateImagesToCloudinary.js --dry-run  (preview without changes)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Import models
import productModel from '../models/ProductModel.js';
import sliderModel from '../models/SliderModel.js';
import Media from '../models/MediaModel.js';

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

// Stats tracking
const stats = {
  productsProcessed: 0,
  slidersProcessed: 0,
  imagesUploaded: 0,
  imagesFailed: 0,
  imagesSkipped: 0,
  errors: []
};

/**
 * Check if URL is a local upload path
 */
function isLocalUpload(url) {
  if (!url) return false;
  return url.startsWith('/uploads/') || url.includes('/uploads/');
}

/**
 * Check if URL is already a Cloudinary URL
 */
function isCloudinaryUrl(url) {
  if (!url) return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Upload a local file to Cloudinary
 */
async function uploadToCloudinary(localPath, folder = 'products') {
  try {
    // Build full path to local file
    const fullPath = path.join(__dirname, '..', localPath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      console.log(`  ⚠️  File not found: ${localPath}`);
      return null;
    }

    if (isDryRun) {
      console.log(`  [DRY RUN] Would upload: ${localPath}`);
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1234567890/basak-pastanesi/${folder}/migrated-image.jpg`;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: `basak-pastanesi/${folder}`,
      resource_type: 'auto',
      transformation: [
        { width: 2000, height: 2000, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    console.log(`  ✅ Uploaded: ${localPath} → ${result.secure_url}`);
    stats.imagesUploaded++;

    return result.secure_url;
  } catch (error) {
    console.error(`  ❌ Upload failed: ${localPath} - ${error.message}`);
    stats.imagesFailed++;
    stats.errors.push({ path: localPath, error: error.message });
    return null;
  }
}

/**
 * Migrate product images
 */
async function migrateProducts() {
  console.log('\n📦 Processing Products...\n');

  const products = await productModel.find({});
  console.log(`Found ${products.length} products to check\n`);

  for (const product of products) {
    const hasLocalImages = product.image && product.image.some(img => isLocalUpload(img));

    if (!hasLocalImages) {
      if (isVerbose) {
        console.log(`⏭️  ${product.name} - No local images, skipping`);
      }
      continue;
    }

    console.log(`🔄 Processing: ${product.name}`);
    stats.productsProcessed++;

    const newImageUrls = [];
    let hasChanges = false;

    for (let i = 0; i < product.image.length; i++) {
      const imageUrl = product.image[i];

      if (isCloudinaryUrl(imageUrl)) {
        // Already Cloudinary, keep as-is
        newImageUrls.push(imageUrl);
        console.log(`  ✓ Image ${i + 1}: Already on Cloudinary`);
      } else if (isLocalUpload(imageUrl)) {
        // Upload to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(imageUrl, 'products');

        if (cloudinaryUrl) {
          newImageUrls.push(cloudinaryUrl);
          hasChanges = true;

          // Create Media record
          if (!isDryRun) {
            try {
              const media = new Media({
                filename: path.basename(imageUrl),
                originalName: path.basename(imageUrl),
                mimetype: 'image/jpeg',
                url: cloudinaryUrl,
                secureUrl: cloudinaryUrl,
                category: 'product',
                folder: 'products',
                alt: `${product.name} - Migrated image ${i + 1}`,
                title: `${product.name} - Image ${i + 1}`,
                uploadedBy: 'migration-script',
                usedIn: [{
                  type: 'product',
                  id: product._id.toString(),
                  url: `/product/${product._id}`,
                  addedAt: new Date()
                }],
                processing: {
                  status: 'completed',
                  optimized: true,
                  cloudinary: true
                }
              });
              await media.save();
            } catch (mediaError) {
              console.log(`  ⚠️  Media record creation failed: ${mediaError.message}`);
            }
          }
        } else {
          // Keep original URL if upload failed
          newImageUrls.push(imageUrl);
          stats.imagesSkipped++;
        }
      } else {
        // Unknown format, keep as-is
        newImageUrls.push(imageUrl);
      }
    }

    // Update product if there were changes
    if (hasChanges && !isDryRun) {
      await productModel.findByIdAndUpdate(product._id, {
        image: newImageUrls
      });
      console.log(`  💾 Product updated with ${newImageUrls.length} images\n`);
    } else if (hasChanges && isDryRun) {
      console.log(`  [DRY RUN] Would update product with ${newImageUrls.length} images\n`);
    }
  }
}

/**
 * Migrate slider images
 */
async function migrateSliders() {
  console.log('\n🖼️  Processing Sliders...\n');

  const sliders = await sliderModel.find({});
  console.log(`Found ${sliders.length} sliders to check\n`);

  for (const slider of sliders) {
    const imageFields = ['image', 'mobileImage', 'backgroundImage'];
    let hasChanges = false;
    const updates = {};

    // Check if any field has local uploads
    const hasLocalImages = imageFields.some(field => isLocalUpload(slider[field]));

    if (!hasLocalImages) {
      if (isVerbose) {
        console.log(`⏭️  Slider ${slider._id} - No local images, skipping`);
      }
      continue;
    }

    console.log(`🔄 Processing Slider: ${slider.title || slider._id}`);
    stats.slidersProcessed++;

    for (const field of imageFields) {
      const imageUrl = slider[field];

      if (!imageUrl) continue;

      if (isCloudinaryUrl(imageUrl)) {
        console.log(`  ✓ ${field}: Already on Cloudinary`);
      } else if (isLocalUpload(imageUrl)) {
        const cloudinaryUrl = await uploadToCloudinary(imageUrl, 'sliders');

        if (cloudinaryUrl) {
          updates[field] = cloudinaryUrl;
          hasChanges = true;
        }
      }
    }

    // Update slider if there were changes
    if (hasChanges && !isDryRun) {
      await sliderModel.findByIdAndUpdate(slider._id, updates);
      console.log(`  💾 Slider updated\n`);
    } else if (hasChanges && isDryRun) {
      console.log(`  [DRY RUN] Would update slider\n`);
    }
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   Cloudinary Migration Script');
  console.log('   Moving local /uploads images to Cloudinary CDN');
  console.log('═══════════════════════════════════════════════════════════');

  if (isDryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Verify Cloudinary config
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.error('❌ Cloudinary credentials not configured!');
    console.error('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);

  // Connect to MongoDB
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }

  try {
    // Migrate products
    await migrateProducts();

    // Migrate sliders
    await migrateSliders();

    // Print summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   Migration Summary');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Products processed: ${stats.productsProcessed}`);
    console.log(`   Sliders processed:  ${stats.slidersProcessed}`);
    console.log(`   Images uploaded:    ${stats.imagesUploaded}`);
    console.log(`   Images skipped:     ${stats.imagesSkipped}`);
    console.log(`   Images failed:      ${stats.imagesFailed}`);

    if (stats.errors.length > 0) {
      console.log('\n   Errors:');
      stats.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.error}`);
      });
    }

    if (isDryRun) {
      console.log('\n   ⚠️  This was a DRY RUN - no actual changes were made');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n   ✅ Migration completed successfully!');
    }

    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run migration
main().catch(console.error);
