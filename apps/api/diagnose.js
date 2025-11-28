
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from .env in the same directory
const apiEnvPath = path.resolve(__dirname, '.env');
console.log(`Loading .env from: ${apiEnvPath}`);

if (fs.existsSync(apiEnvPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(apiEnvPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} else {
    console.error('❌ .env file not found!');
    process.exit(1);
}

async function checkMongoDB() {
    console.log('\n--- Checking MongoDB ---');
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI is missing in .env');
        return false;
    }
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB Connected Successfully!');
        console.log(`   Database: ${mongoose.connection.name}`);
        await mongoose.disconnect();
        return true;
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        return false;
    }
}

async function checkCloudinary() {
    console.log('\n--- Checking Cloudinary ---');
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        console.error('❌ Cloudinary credentials missing in .env');
        return false;
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
    });

    try {
        console.log('Pinging Cloudinary...');
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary Connection Successful!', result);
        return true;
    } catch (error) {
        console.error('❌ Cloudinary Connection Failed:', error.message);
        return false;
    }
}

async function checkRedis() {
    console.log('\n--- Checking Redis ---');
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    if (process.env.REDIS_ENABLED === 'false') {
        console.log('⚠️ Redis is explicitly disabled in .env');
        return true; // Not a failure
    }

    const client = createClient({ url: redisUrl });

    client.on('error', (err) => {
        // Suppress error logs here, handled in try/catch
    });

    try {
        console.log(`Connecting to Redis at ${redisUrl}...`);
        await client.connect();
        console.log('✅ Redis Connected Successfully!');
        await client.disconnect();
        return true;
    } catch (error) {
        console.error('❌ Redis Connection Failed:', error.message);
        return false;
    }
}

async function checkApiPort() {
    console.log('\n--- Checking API Port (4001) ---');
    return new Promise((resolve) => {
        const req = http.get('http://localhost:4001/api/product/list', (res) => {
            console.log(`✅ API is reachable. Status Code: ${res.statusCode}`);
            resolve(true);
        });

        req.on('error', (e) => {
            console.error(`❌ API is NOT reachable on port 4001: ${e.message}`);
            resolve(false);
        });
    });
}

async function runDiagnostics() {
    console.log('🚀 Starting Infrastructure Diagnostics (from apps/api)...');

    const mongoStatus = await checkMongoDB();
    const cloudStatus = await checkCloudinary();
    const redisStatus = await checkRedis();
    const apiStatus = await checkApiPort();

    console.log('\n--- Summary ---');
    console.log(`MongoDB:    ${mongoStatus ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Cloudinary: ${cloudStatus ? '✅ OK' : '❌ FAILED'}`);
    console.log(`Redis:      ${redisStatus ? '✅ OK' : '❌ FAILED'}`);
    console.log(`API Server: ${apiStatus ? '✅ OK' : '❌ FAILED'}`);

    if (!mongoStatus || !cloudStatus || !redisStatus) {
        console.error('\nCRITICAL: Core infrastructure issues detected.');
        process.exit(1);
    } else {
        console.log('\nInfrastructure seems healthy.');
        process.exit(0);
    }
}

runDiagnostics();
