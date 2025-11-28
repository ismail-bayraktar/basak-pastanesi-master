import mongoose from "mongoose";

// Keyword array limit validator
const arrayLimit = (val) => val.length <= 10;

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    subCategory: { type: String },
    sizes: { type: [Number], default: [] },
    weights: { type: [Number], default: [] },
    freshType: { type: String, enum: ['taze', 'kuru'], default: 'taze' },
    packaging: { type: String, enum: ['standart', 'özel'], default: 'standart' },
    giftWrap: { type: Boolean, default: false },
    labels: { type: [String], default: [] },
    personCounts: { type: [String], default: [] },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    sizePrices: [{ size: Number, price: Number }],
    stock: { type: Number, default: 0 },
    allergens: { type: String }, // Alerjen bilgileri
    ingredients: { type: String }, // Malzemeler
    shelfLife: { type: String }, // Raf ömrü/tazeleme bilgisi
    storageInfo: { type: String }, // Saklama koşulları
    // Review fields
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Product Identification Fields
    sku: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
        sparse: true, // Allow null during creation, will be auto-generated
        index: true
    },
    barcode: {
        type: String,
        trim: true,
        default: null,
        sparse: true, // Allow null, optional field for GTIN/EAN
        index: true
    },

    // SEO Fields
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true // Allow null during creation, will be auto-generated
    },
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
        default: [],
        validate: [arrayLimit, 'Maksimum 10 keyword eklenebilir']
    },

    // Soft Delete Fields
    active: {
        type: Boolean,
        default: true,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: String,
        default: null
    }
}, { timestamps: true })

// Performance indexes
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ bestseller: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ basePrice: 1 });
productSchema.index({ date: -1 });
productSchema.index({ 'sizePrices.price': 1 });
productSchema.index({ active: 1, date: -1 }); // For filtering active products
// Note: slug, sku, barcode indexes are automatically created by unique: true in schema

// Auto-generate SKU before save
productSchema.pre('save', async function (next) {
    // Auto-generate SKU if not provided
    if (!this.sku && this.isNew) {
        try {
            // Get category to extract code
            const Category = mongoose.model('category');
            const category = await Category.findById(this.category);

            // Generate category code from first 3 letters (uppercase)
            const categoryCode = category ? category.name.substring(0, 3).toUpperCase() : 'PRD';

            // Get first size (gramaj) for SKU
            const size = 'STD';

            // Find the last product with similar SKU pattern to get next counter
            const lastProduct = await mongoose.model('product')
                .findOne({ sku: new RegExp(`^${categoryCode}-${size}-`) })
                .sort({ sku: -1 })
                .select('sku')
                .lean();

            let counter = 1;
            if (lastProduct && lastProduct.sku) {
                // Extract counter from last SKU (format: CAT-SIZE-###)
                const parts = lastProduct.sku.split('-');
                if (parts.length === 3) {
                    counter = parseInt(parts[2]) + 1;
                }
            }

            // Generate SKU: CATEGORY-SIZE-COUNTER
            // Example: TUL-250-001, TUL-500-002
            this.sku = `${categoryCode}-${size}-${String(counter).padStart(3, '0')}`;
        } catch (error) {
            console.error('SKU generation error:', error);
            // Fallback to simple counter if category fetch fails
            const count = await mongoose.model('product').countDocuments();
            this.sku = `PRD-${String(count + 1).padStart(6, '0')}`;
        }
    }

    // Auto-generate slug from name
    if (this.isModified('name') || !this.slug) {
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

        // Ensure uniqueness
        try {
            const slugRegex = new RegExp(`^${slug}(-[0-9]*)?$`, 'i');
            const productsWithSlug = await mongoose.model('product').find({
                slug: slugRegex,
                _id: { $ne: this._id }
            });

            if (productsWithSlug.length > 0) {
                slug = `${slug}-${productsWithSlug.length + 1}`;
            }
        } catch (error) {
            console.error('Slug uniqueness check error:', error);
            // Fallback: append random string
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }

        this.slug = slug;
    }

    // Auto-generate metaTitle if not provided
    if ((this.isModified('name') || this.isModified('category')) && !this.metaTitle) {
        let title = `${this.name} | ${this.category} - Basak Pastanesi`;
        if (title.length > 60) {
            title = title.substring(0, 57) + '...';
        }
        this.metaTitle = title;
    }

    // Auto-generate metaDescription if not provided
    if ((this.isModified('description') || this.isModified('category')) && !this.metaDescription) {
        let desc = this.description;
        if (desc.length > 160) {
            desc = desc.substring(0, 157) + '...';
        }
        this.metaDescription = desc;
    }

    // Auto-generate keywords if not provided or empty
    if ((this.isModified('name') || this.isModified('category')) && (!this.keywords || this.keywords.length === 0)) {
        const nameWords = this.name.toLowerCase().split(' ').filter(w => w.length > 2);
        // Only use category words if category is populated (has name property)
        const categoryWords = (typeof this.category === 'string')
            ? this.category.toLowerCase().split(' ').filter(w => w.length > 2)
            : [];
        const allWords = [...new Set([...nameWords, ...categoryWords])];
        this.keywords = allWords.slice(0, 10);
    }

    next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
