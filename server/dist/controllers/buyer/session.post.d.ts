import type { Request, Response } from 'express';
/**
 * POST /api/buyer/session
 * Create or retrieve buyer session for anonymous purchases
 * Uses browser fingerprinting and session token
 */
export declare function createBuyerSession(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=session.post.d.ts.map