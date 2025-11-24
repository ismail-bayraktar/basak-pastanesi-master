import { z } from 'zod';

export const placeOrderSchema = z.object({
    userId: z.string().optional(), // Optional for guest checkout
    isGuest: z.boolean().optional(), // Flag for guest orders
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        size: z.union([z.string(), z.number()]).optional(),
    })).min(1, "Order must contain at least one item"),
    amount: z.number().min(0, "Amount must be positive"),
    address: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(), // Guest email for notifications
        phone: z.string().optional(),
        address: z.string().min(1, "Address is required"),
        city: z.string().optional(),
        district: z.string().optional(),
    }),
    paymentMethod: z.enum(['KAPIDA', 'HAVALE', 'PAYTR']).default('KAPIDA'),
    delivery: z.object({
        zoneId: z.string().optional(),
        sameDay: z.boolean().optional(),
        fee: z.number().optional(),
    }).optional(),
    codFee: z.number().optional(),
    giftNote: z.string().optional(),
});

export const updateStatusSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    status: z.enum([
        'Siparişiniz Alındı',
        'Siparişiniz Hazırlanıyor',
        'Kuryeye Verildi',
        'Siparişiniz Yola Çıktı',
        'Teslim Edildi',
        'İptal Edildi',
        'Şube Atandı'
    ]),
});

export const assignBranchSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    branchId: z.string().min(1, "Branch ID is required"),
});

export const orderIdSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
});
