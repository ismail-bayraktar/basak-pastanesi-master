/**
 * Migrate Existing Media Files to Media Model
 * 
 * This script scans /assets/ and /uploads/ directories
 * and creates Media model entries for existing files
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/mongodb.js';
import Media from '../models/MediaModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scanDirectory = (dirPath, baseUrl) => {
    const files = [];
    try {
        if (!fs.existsSync(dirPath)) {
            console.log(`Directory does not exist: ${dirPath}`);
            return files;
        }

        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isFile()) {
                // Check if it's an image file
                const ext = path.extname(item).toLowerCase();
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
                
                if (imageExtensions.includes(ext)) {
                    files.push({
                        filename: item,
                        path: fullPath,
                        size: stat.size,
                        url: dirPath.includes('assets') ? `/assets/${item}` : `/uploads/${item}`,
                        folder: dirPath.includes('assets') ? 'assets' : 'uploads',
                        category: 'general' // Will be updated based on usage
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
    return files;
};

const migrateMedia = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB');

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:4001';
        
        // Scan directories
        const assetsPath = path.join(__dirname, '../..', 'frontend/public/assets');
        const uploadsPath = path.join(__dirname, '..', 'uploads');
        
        console.log('\n📁 Scanning directories...');
        console.log(`Assets: ${assetsPath}`);
        console.log(`Uploads: ${uploadsPath}`);
        
        const assetsFiles = scanDirectory(assetsPath, baseUrl);
        const uploadsFiles = scanDirectory(uploadsPath, baseUrl);
        
        const allFiles = [...assetsFiles, ...uploadsFiles];
        console.log(`\n📊 Found ${allFiles.length} image files`);
        
        if (allFiles.length === 0) {
            console.log('No files to migrate');
            process.exit(0);
        }

        // Get existing media filenames to avoid duplicates
        const existingMedia = await Media.find({}, { filename: 1 });
        const existingFilenames = new Set(existingMedia.map(m => m.filename));
        console.log(`\n📋 Found ${existingFilenames.size} existing media records`);

        // Filter out already migrated files
        const filesToMigrate = allFiles.filter(file => !existingFilenames.has(file.filename));
        console.log(`\n🔄 Migrating ${filesToMigrate.length} new files...`);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const file of filesToMigrate) {
            try {
                // Determine mimetype
                const ext = path.extname(file.filename).toLowerCase();
                const mimetypeMap = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif',
                    '.webp': 'image/webp',
                    '.svg': 'image/svg+xml',
                    '.bmp': 'image/bmp'
                };
                const mimetype = mimetypeMap[ext] || 'image/jpeg';

                // Determine category based on folder or filename
                let category = 'general';
                if (file.folder === 'assets') {
                    if (file.filename.includes('slider')) category = 'slider';
                    else if (file.filename.includes('logo')) category = 'logo';
                    else if (file.filename.includes('banner')) category = 'banner';
                }

                const media = new Media({
                    filename: file.filename,
                    originalName: file.filename,
                    mimetype: mimetype,
                    size: file.size,
                    path: file.path,
                    url: file.url,
                    secureUrl: `${baseUrl}${file.url}`,
                    folder: file.folder,
                    category: category,
                    alt: file.filename,
                    title: path.basename(file.filename, path.extname(file.filename)),
                    description: `Migrated from ${file.folder} directory`,
                    uploadedBy: 'system',
                    isActive: true,
                    isPublic: true
                });

                await media.save();
                successCount++;
                
                if (successCount % 10 === 0) {
                    console.log(`  ✅ Migrated ${successCount}/${filesToMigrate.length} files...`);
                }
            } catch (error) {
                errorCount++;
                errors.push({ file: file.filename, error: error.message });
                console.error(`  ❌ Error migrating ${file.filename}:`, error.message);
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`  ✅ Success: ${successCount}`);
        console.log(`  ❌ Errors: ${errorCount}`);
        
        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach(err => {
                console.log(`  - ${err.file}: ${err.error}`);
            });
        }

        // Update product images to link with Media model
        console.log('\n🔗 Linking product images to Media model...');
        const productModel = mongoose.model('Product', mongoose.Schema({}, { strict: false }));
        const products = await productModel.find({ image: { $exists: true, $ne: [] } });
        
        let linkedCount = 0;
        for (const product of products) {
            if (Array.isArray(product.image) && product.image.length > 0) {
                for (const imagePath of product.image) {
                    const filename = path.basename(imagePath);
                    const media = await Media.findOne({ filename: filename });
                    
                    if (media) {
                        // Update media usedIn
                        const existingUsage = media.usedIn.find(u => u.id === product._id.toString());
                        if (!existingUsage) {
                            media.usedIn.push({
                                type: 'product',
                                id: product._id.toString(),
                                url: `/product/${product._id}`,
                                addedAt: new Date()
                            });
                            await media.save();
                            linkedCount++;
                        }
                    }
                }
            }
        }
        console.log(`  ✅ Linked ${linkedCount} product images`);

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

migrateMedia();

