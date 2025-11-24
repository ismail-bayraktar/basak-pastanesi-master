import mongoose from "mongoose";
import logger from "../utils/logger.js";

// AGGRESSIVE Serverless connection caching for Vercel
let cachedConnection = null;
let connectionPromise = null;

function buildMongoUri() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '') {
    return process.env.MONGODB_URI.trim();
  }

  const user = process.env.MONGO_USERNAME;
  const pass = process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST || '127.0.0.1';
  const port = process.env.MONGO_PORT || '27017';
  const db = process.env.MONGO_DB || 'ecommerce';
  const authSource = process.env.MONGO_AUTHSOURCE || (user ? 'admin' : undefined);

  const credentials = user && pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : '';
  const qs = authSource ? `?authSource=${encodeURIComponent(authSource)}` : '';
  return `mongodb://${credentials}${host}:${port}/${db}${qs}`;
}

const connectDB = async () => {
  // Check if we have a valid cached connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.debug('♻️ Reusing cached MongoDB connection');
    return cachedConnection;
  }

  // If there's already a connection attempt in progress, wait for it
  if (connectionPromise) {
    logger.debug('⏳ Waiting for pending MongoDB connection...');
    return connectionPromise;
  }

  // Create new connection
  connectionPromise = (async () => {
    try {
      // Setup event handlers only once
      if (!mongoose.connection.eventNames().includes('connected')) {
        mongoose.connection.on("connected", () => {
          logger.info("✅ MongoDB connected");
        });

        mongoose.connection.on("error", (err) => {
          logger.error("❌ MongoDB connection error", { error: err.message });
          cachedConnection = null;
        });

        mongoose.connection.on("disconnected", () => {
          logger.warn("⚠️ MongoDB disconnected");
          cachedConnection = null;
        });
      }

      const mongoUri = buildMongoUri();

      // OPTIMIZED for MongoDB Atlas M0 (Free Tier) + Vercel
      await mongoose.connect(mongoUri, {
        // Balanced timeouts - not too fast to fail, not too slow
        serverSelectionTimeoutMS: 5000,   // Increased for cold starts
        connectTimeoutMS: 10000,          // Increased for network latency
        socketTimeoutMS: 30000,

        // Minimal pool for free tier (M0 has max 500 concurrent connections cluster-wide)
        maxPoolSize: 3,
        minPoolSize: 1,

        // Keep connections alive longer (reduces cold starts)
        maxIdleTimeMS: 60000,

        // Retry settings for resilience
        retryWrites: true,
        retryReads: true,

        // Use compression to reduce bandwidth
        compressors: ['zlib'],

        // Heartbeat for connection health
        heartbeatFrequencyMS: 10000,

        // Auto-reconnect settings
        family: 4,  // Use IPv4 to avoid DNS issues
      });

      cachedConnection = mongoose.connection;
      logger.info("🚀 MongoDB connected successfully (cached for reuse)");

      return cachedConnection;
    } catch (error) {
      cachedConnection = null;
      connectionPromise = null;
      logger.error("💥 MongoDB connection failed", { error: error.message });
      throw error;
    } finally {
      // Clear the promise after connection attempt
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

export default connectDB;


