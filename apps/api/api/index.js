/**
 * Vercel Serverless Function Entry Point
 * Handles all API requests in serverless environment
 */
import app from '../app.js';

// For Vercel serverless functions, we need to export the app directly
// Vercel will handle the request/response wrapping
export default app;
