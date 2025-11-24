import { z } from 'zod';

export const adminLoginSchema = z.object({
    email: z.string().email("Geçersiz email adresi"),
    password: z.string().min(1, "Şifre gereklidir")
});

export const createAdminSchema = z.object({
    name: z.string().min(1, "İsim gereklidir"),
    email: z.string().email("Geçersiz email adresi"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    role: z.enum(['super_admin', 'admin', 'editor', 'support']).default('admin'),
    permissions: z.array(z.string()).optional()
});

export const updateAdminSchema = z.object({
    adminId: z.string().optional(), // From params usually, but can be validated if in body
    name: z.string().optional(),
    email: z.string().email("Geçersiz email adresi").optional(),
    role: z.enum(['super_admin', 'admin', 'editor', 'support']).optional(),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
});

export const adminIdSchema = z.object({
    adminId: z.string().min(1, "Admin ID gereklidir")
});
