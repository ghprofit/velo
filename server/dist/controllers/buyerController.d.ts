import type { Request, Response } from 'express';
/**
 * Create or retrieve buyer session for anonymous purchases
 * Uses browser fingerprinting and session token
 */
export declare function getBuyerSession(req: Request, res: Response): Promise<void>;
/**
 * Get buyer's purchase history
 */
export declare function getBuyerPurchases(req: Request, res: Response): Promise<void>;
/**
 * Verify access to purchased content
 */
export declare function verifyContentAccess(req: Request, res: Response): Promise<void>;
/**
 * Clean up expired buyer sessions (should be run as a scheduled task)
 */
export declare function cleanupExpiredSessions(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=buyerController.d.ts.map