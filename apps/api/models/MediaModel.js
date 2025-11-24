import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    // Basic Information
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },

    // Cloudinary Specific (optional for local storage)
    // Note: publicId is only used for Cloudinary, not for local storage
    // We don't set unique constraint here to avoid issues with null values
    publicId: {
        type: String,
        required: false
        // Removed unique constraint - only needed when using Cloudinary
        // If using Cloudinary, set unique index manually: mediaSchema.index({ publicId: 1 }, { sparse: true, unique: true });
    },
    url: {
        type: String,
        required: true
    },
    secureUrl: {
        type: String,
        required: false // Optional for local storage
    },
    resourceType: {
        type: String,
        default: 'image'
    },
    format: {
        type: String,
        default: 'jpg'
    },

    // Image Processing
    width: Number,
    height: Number,
    aspectRatio: Number,
    bytes: Number,

    // Responsive Images (Generated URLs)
    responsive: {
        thumbnail: String,
        small: String,
        medium: String,
        large: String
    },

    // SEO and Accessibility
    alt: String,
    title: String,
    description: String,

    // Organization
    folder: {
        type: String,
        default: 'basak-pastanesi'
    },
    tags: [{
        type: String
    }],
    category: {
        type: String,
        enum: ['slider', 'product', 'blog', 'general', 'logo', 'banner', 'category', 'user'],
        default: 'general'
    },

    // Usage Tracking
    usedIn: [{
        type: {
            type: String,     // 'slider', 'product', 'blog', etc.
            required: false
        },
        id: String,        // ID of the item using this media
        url: String,       // Context URL
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Analytics
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    lastViewed: Date,

    // Status and Security
    isActive: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },

    // Processing Status
    processing: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'completed'
        },
        error: String
    },

    // Upload Metadata
    uploadedBy: {
        type: String,
        default: 'admin'
    },
    uploadIP: String,
    deviceInfo: {
        userAgent: String,
        platform: String
    },

    // EXIF Data (for images)
    exif: {
        camera: String,
        dateTaken: Date,
        location: {
            latitude: Number,
            longitude: Number
        }
    }

}, {
    timestamps: true
});

// Index for better search performance
mediaSchema.index({ filename: 1 });
mediaSchema.index({ folder: 1 });
mediaSchema.index({ category: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ mimetype: 1 });

const Media = mongoose.model('Media', mediaSchema);

export default Media;