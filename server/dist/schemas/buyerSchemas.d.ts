import { z } from 'zod';
export declare const createBuyerSessionSchema: z.ZodObject<{
    fingerprint: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateBuyerSessionInput = z.infer<typeof createBuyerSessionSchema>;
export declare const accessTokenParamSchema: z.ZodObject<{
    accessToken: z.ZodString;
}, z.core.$strip>;
export type AccessTokenParams = z.infer<typeof accessTokenParamSchema>;
//# sourceMappingURL=buyerSchemas.d.ts.map