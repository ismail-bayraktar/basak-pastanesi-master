import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema({
    // Template System
    template: {
        type: String,
        enum: ['split-left', 'split-right', 'centered', 'overlay', 'full-width', 'v2-premium'],
        default: 'split-left'
    },

    // Content Fields (Flexible based on template)
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    // CTA Button Fields
    buttonText: {
        type: String,
        required: true
    },
    buttonLink: {
        type: String,
        default: "/collection"
    },
    buttonStyle: {
        type: String,
        enum: ['primary', 'secondary', 'outline'],
        default: 'primary'
    },

    // Media Fields
    image: {
        type: String,
        required: true
    },
    mobileImage: {
        type: String // Optional mobile-specific image
    },
    backgroundImage: {
        type: String // For full-width/overlay templates
    },

    // Visual Settings
    overlayOpacity: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    textColor: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto'
    },

    // Analytics Fields
    viewCount: {
        type: Number,
        default: 0
    },
    clickCount: {
        type: Number,
        default: 0
    },
    lastViewed: {
        type: Date
    },

    // SEO Fields
    altText: {
        type: String,
        default: ""
    },
    seoTitle: {
        type: String,
        default: ""
    },

    // Management Fields
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date // For scheduled publishing
    },
    endDate: {
        type: Date // For scheduled expiration
    }
}, {
    timestamps: true
});

const Slider = mongoose.model('Slider', sliderSchema);
export default Slider;
