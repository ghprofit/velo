import type { Request, Response } from 'express';
/**
 * Clean up expired buyer sessions (should be run as a scheduled task)
 */
export declare function cleanupExpiredSessions(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=cleanup.delete.d.ts.map