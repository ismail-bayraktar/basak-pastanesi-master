import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kategori adı gereklidir'],
        unique: true,
        trim: true,
        minlength: [2, 'Kategori adı en az 2 karakter olmalıdır'],
        maxlength: [50, 'Kategori adı en fazla 50 karakter olabilir']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Açıklama en fazla 200 karakter olabilir']
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    },
    image: {
        type: String,
        trim: true,
        default: null
    },
    // SEO Fields
    metaTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'Meta title en fazla 60 karakter olabilir']
    },
    metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description en fazla 160 karakter olabilir']
    },
    keywords: {
        type: [String],
        default: []
    },
    order: {
        type: Number,
        default: 0,
        index: true
    },
    productCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for performance
// categorySchema.index({ name: 1 }); // Already has unique: true in schema
// categorySchema.index({ slug: 1 }); // Already has unique: true in schema
categorySchema.index({ active: 1, order: 1 });

// Auto-generate slug from name before save
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        // Turkish character replacement
        const turkishMap = {
            'ç': 'c', 'Ç': 'C',
            'ğ': 'g', 'Ğ': 'G',
            'ı': 'i', 'İ': 'I',
            'ö': 'o', 'Ö': 'O',
            'ş': 's', 'Ş': 'S',
            'ü': 'u', 'Ü': 'U'
        };

        let slug = this.name.toLowerCase();

        // Replace Turkish characters
        Object.keys(turkishMap).forEach(key => {
            slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
        });

        // Replace spaces and special chars with dash
        slug = slug
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        this.slug = slug;
    }
    next();
});

// Virtual for related products (populate later if needed)
categorySchema.virtual('products', {
    ref: 'product',
    localField: '_id',
    foreignField: 'category',
    justOne: false
});

// Method to update product count
categorySchema.methods.updateProductCount = async function() {
    const Product = mongoose.model('product');
    const count = await Product.countDocuments({ category: this._id });
    this.productCount = count;
    await this.save();
    return count;
};

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;
