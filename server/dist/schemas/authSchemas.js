import { z } from 'zod';
// Register schema
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    displayName: z.string().min(2, 'Display name must be at least 2 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    country: z.string().length(2, 'Country code must be 2 characters').optional(),
});
// Login schema
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
// Refresh token schema
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});
// Logout schema
export const logoutSchema = z.object({
    refreshToken: z.string().optional(),
});
//# sourceMappingURL=authSchemas.js.map