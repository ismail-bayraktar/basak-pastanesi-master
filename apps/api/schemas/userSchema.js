import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email("Geçersiz email adresi"),
    password: z.string().min(1, "Şifre gereklidir")
});

export const registerSchema = z.object({
    name: z.string().min(1, "İsim gereklidir"),
    email: z.string().email("Geçersiz email adresi"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır")
});

export const adminLoginSchema = z.object({
    email: z.string().email("Geçersiz email adresi"),
    password: z.string().min(1, "Şifre gereklidir")
});
