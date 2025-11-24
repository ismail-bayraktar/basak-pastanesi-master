/**
 * Test Setup File
 * Configures test environment, mocks, and utilities
 */

import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tulumbak-test';

// Global test timeout
jest.setTimeout(30000);

// Mock logger to avoid file system operations during tests
jest.mock('../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  },
  logInfo: jest.fn(),
  logError: jest.fn()
}));

// Mock Sentry
jest.mock('../utils/sentry.js', () => ({
  initSentry: jest.fn(),
  captureException: jest.fn()
}));

// Database connection for tests
let mongoConnection = null;

beforeAll(async () => {
  try {
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error('Test database connection failed:', error);
  }
});

afterAll(async () => {
  if (mongoConnection) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Test helpers
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  admin: null,
  ...overrides
});

export const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => jest.fn();

// Generate test JWT token
export const generateTestToken = (payload = {}) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: 'test-user-id', email: 'test@example.com', ...payload },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

