import { z } from 'zod';
// Manual verification schema (admin only)
export const manualVerificationSchema = z.object({
    creatorId: z.string().min(1, 'Creator ID is required'),
    status: z.enum(['VERIFIED', 'REJECTED'], {
        message: 'Status must be either VERIFIED or REJECTED',
    }),
    notes: z.string().optional(),
});
// Veriff webhook event schema
export const veriffWebhookSchema = z.object({
    id: z.string(),
    feature: z.string(),
    code: z.number(),
    action: z.string(),
    vendorData: z.string().optional(),
});
//# sourceMappingURL=verificationSchemas.js.map