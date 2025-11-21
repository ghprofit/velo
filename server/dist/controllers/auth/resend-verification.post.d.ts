import type { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    userId?: string;
}
export declare const resendVerificationEmail: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=resend-verification.post.d.ts.map