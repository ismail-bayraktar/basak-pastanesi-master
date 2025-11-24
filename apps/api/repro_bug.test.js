import app from './app.js';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ProductService from './services/ProductService.js';

// Mock Admin Auth
jest.mock('./middleware/AdminAuth.js', () => (req, res, next) => {
    req.admin = { id: 'mock-admin-id' };
    next();
});

// Mock Multer to avoid actual file uploads but simulate req.files
jest.mock('./middleware/multer.js', () => {
    const multer = require('multer');
    const upload = multer();
    return {
        fields: () => (req, res, next) => {
            req.files = {}; // Simulate no files uploaded
            next();
        }
    };
});

describe('Product Update Bug Reproduction', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('should update product without files', async () => {
        // 1. Create a dummy product
        const product = await ProductService.addProduct({
            name: 'Test Product',
            description: 'Desc',
            basePrice: 100,
            category: new mongoose.Types.ObjectId(),
            sizes: [1],
            image: ['http://example.com/img.jpg']
        }, {});

        // 2. Try to update it without files
        const res = await request(app)
            .post('/api/product/update')
            .send({
                id: product._id.toString(),
                name: 'Updated Product',
                description: 'Updated Desc',
                basePrice: 150,
                category: product.category.toString(),
                sizes: [1, 1.5],
                // No images sent
            });

        console.log('Update Response:', res.body);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
