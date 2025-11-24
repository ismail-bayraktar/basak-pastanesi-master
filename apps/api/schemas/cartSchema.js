import { z } from 'zod';

export const addToCartSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    itemId: z.string().min(1, "Item ID is required"),
    size: z.union([z.string(), z.number()]).optional(), // Size can be string or number
});

export const updateCartSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    itemId: z.string().min(1, "Item ID is required"),
    size: z.union([z.string(), z.number()]).optional(),
    quantity: z.number().min(0, "Quantity must be 0 or greater"),
});

export const getUserCartSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
});
