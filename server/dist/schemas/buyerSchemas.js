import { z } from 'zod';
// Create buyer session schema
export const createBuyerSessionSchema = z.object({
    fingerprint: z.string().optional(),
});
// Verify content access schema (params)
export const accessTokenParamSchema = z.object({
    accessToken: z.string().min(1, 'Access token is required'),
});
//# sourceMappingURL=buyerSchemas.js.map