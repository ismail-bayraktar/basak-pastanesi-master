import mongoose from "mongoose";
import reviewModel from "../models/ReviewModel.js";
import productModel from "../models/ProductModel.js";
import orderModel from "../models/OrderModel.js";
import logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { z } from 'zod';

// Validation schemas
const createReviewSchema = z.object({
    productId: z.string().min(1, "Ürün ID gereklidir"),
    rating: z.number().min(1).max(5, "Rating 1-5 arasında olmalıdır"),
    comment: z.string().max(1000, "Yorum en fazla 1000 karakter olabilir").optional(),
    orderId: z.string().optional()
});

/**
 * Create a new review
 */
const createReview = async (req, res) => {
    try {
        const userId = req.body.userId;
        const validation = createReviewSchema.safeParse(req.body);

        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { productId, rating, comment, orderId } = validation.data;

        // Verify product exists
        const product = await productModel.findById(productId);
        if (!product) {
            return errorResponse(res, 'Ürün bulunamadı', 404);
        }

        // Check if user already reviewed this product
        const existingReview = await reviewModel.findOne({ userId, productId });
        if (existingReview) {
            return errorResponse(res, 'Bu ürün için zaten yorum yaptınız', 409);
        }

        // If orderId provided, verify user has ordered this product
        let isVerified = false;
        if (orderId) {
            const order = await orderModel.findOne({ 
                _id: orderId, 
                userId: userId.toString() 
            });
            
            if (order && order.items) {
                const hasProduct = order.items.some(item => 
                    (item.id || item.productId) === productId
                );
                if (hasProduct) {
                    isVerified = true;
                }
            }
        }

        const review = new reviewModel({
            userId,
            productId,
            rating,
            comment: comment || '',
            isVerified,
            orderId: orderId || null
        });

        await review.save();

        // Update product average rating
        await updateProductRating(productId);

        logger.info('Review created', { userId, productId, rating, reviewId: review._id });
        successResponse(res, { review }, 'Yorum başarıyla eklendi');
    } catch (error) {
        logger.error('Error creating review', { error: error.message, stack: error.stack });
        errorResponse(res, error.message);
    }
};

/**
 * Get reviews for a product
 */
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        if (!productId) {
            return errorResponse(res, 'Ürün ID gereklidir', 400);
        }

        const skip = (page - 1) * limit;
        const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const reviews = await reviewModel
            .find({ productId, isVisible: true })
            .populate('userId', 'name')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await reviewModel.countDocuments({ productId, isVisible: true });

        // Calculate average rating
        const ratingStats = await reviewModel.aggregate([
            { $match: { productId: mongoose.Types.ObjectId(productId), isVisible: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratingDistribution: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        const stats = ratingStats[0] || {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: []
        };

        // Count ratings by value
        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        stats.ratingDistribution.forEach(rating => {
            if (ratingCounts[rating] !== undefined) {
                ratingCounts[rating]++;
            }
        });

        successResponse(res, {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            stats: {
                averageRating: stats.averageRating ? parseFloat(stats.averageRating.toFixed(1)) : 0,
                totalReviews: stats.totalReviews,
                ratingCounts
            }
        });
    } catch (error) {
        logger.error('Error fetching product reviews', { error: error.message, stack: error.stack });
        errorResponse(res, error.message);
    }
};

/**
 * Get user's reviews
 */
const getUserReviews = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const reviews = await reviewModel
            .find({ userId })
            .populate('productId', 'name image basePrice')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await reviewModel.countDocuments({ userId });

        successResponse(res, {
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching user reviews', { error: error.message, stack: error.stack });
        errorResponse(res, error.message);
    }
};

/**
 * Update product average rating (helper function)
 */
const updateProductRating = async (productId) => {
    try {
        const stats = await reviewModel.aggregate([
            { $match: { productId: new mongoose.Types.ObjectId(productId), isVisible: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);

        if (stats[0]) {
            await productModel.findByIdAndUpdate(productId, {
                averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
                reviewCount: stats[0].reviewCount
            });
        }
    } catch (error) {
        logger.error('Error updating product rating', { error: error.message, productId });
    }
};

export { createReview, getProductReviews, getUserReviews };

