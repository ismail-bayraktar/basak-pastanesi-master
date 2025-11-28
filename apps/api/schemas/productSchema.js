import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, "Ürün adı zorunludur"),
    description: z.string().optional(),
    basePrice: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
    category: z.string().min(1, "Kategori zorunludur"),
    subCategory: z.string().optional(),
    stock: z.coerce.number().min(0).default(0),
    bestseller: z.enum(['true', 'false', 'true', 'false']).transform(val => val === 'true' || val === true).optional(),
    labels: z.union([z.string(), z.array(z.string())]).transform(val => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return val.split(',').map(v => v.trim()).filter(v => v);
        }
    }).optional(),
    freshType: z.enum(['taze', 'kuru']).default('taze'),
    packaging: z.enum(['standart', 'özel']).default('standart'),
    giftWrap: z.enum(['true', 'false', 'true', 'false']).transform(val => val === 'true' || val === true).optional(),
    allergens: z.string().optional(),
    ingredients: z.string().optional(),
    shelfLife: z.string().optional(),
    storageInfo: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.union([z.string(), z.array(z.string())]).transform(val => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return val.split(',').map(v => v.trim()).filter(v => v);
        }
    }).optional(),
    selectedMediaIds: z.union([z.string(), z.array(z.string())]).transform(val => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return val.split(',').map(v => v.trim()).filter(v => v);
        }
    }).optional(),
    // Allow direct image URLs for updates
    imageUrl1: z.string().optional(),
    imageUrl2: z.string().optional(),
    imageUrl3: z.string().optional(),
    imageUrl4: z.string().optional(),
});
