import { z } from 'zod';
export declare const manualVerificationSchema: z.ZodObject<{
    creatorId: z.ZodString;
    status: z.ZodEnum<{
        VERIFIED: "VERIFIED";
        REJECTED: "REJECTED";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ManualVerificationInput = z.infer<typeof manualVerificationSchema>;
export declare const veriffWebhookSchema: z.ZodObject<{
    id: z.ZodString;
    feature: z.ZodString;
    code: z.ZodNumber;
    action: z.ZodString;
    vendorData: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type VeriffWebhookInput = z.infer<typeof veriffWebhookSchema>;
//# sourceMappingURL=verificationSchemas.d.ts.map