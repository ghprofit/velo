import type { Request, Response } from 'express';
/**
 * Initiate Veriff verification session for creator
 */
export declare function initiateVerification(req: Request, res: Response): Promise<void>;
/**
 * Get verification status for creator
 */
export declare function getVerificationStatus(req: Request, res: Response): Promise<void>;
/**
 * Handle Veriff webhook for verification decisions
 */
export declare function handleVeriffWebhook(req: Request, res: Response): Promise<void>;
/**
 * Manually verify creator (Admin only)
 */
export declare function manualVerification(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=verificationController.d.ts.map