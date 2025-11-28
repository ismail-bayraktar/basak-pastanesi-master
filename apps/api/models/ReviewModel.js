import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Yorum en fazla 1000 karakter olabilir']
    },
    isVerified: {
        type: Boolean,
        default: false // Admin onayından sonra true olacak
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    orderId: {
        type: String, // Sipariş ID'si (doğrulanmış yorum için)
    }
}, { timestamps: true });

// Compound index for user-product uniqueness (one review per user per product)
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for product reviews
reviewSchema.index({ productId: 1, isVisible: 1, createdAt: -1 });

// Index for user reviews
reviewSchema.index({ userId: 1, createdAt: -1 });

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema);

export default reviewModel;

