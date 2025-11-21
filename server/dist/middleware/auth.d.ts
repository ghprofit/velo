import type { Request, Response, NextFunction } from 'express';
import { type JWTPayload } from '../utils/auth.js';
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload & {
                id: string;
            };
        }
    }
}
/**
 * Middleware to authenticate requests using JWT
 */
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Middleware to check if user has required role
 */
export declare function authorize(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication - doesn't fail if no token provided
 */
export declare function optionalAuthenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.d.ts.map