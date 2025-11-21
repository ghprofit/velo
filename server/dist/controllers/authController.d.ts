import type { Request, Response } from 'express';
/**
 * Register a new creator account
 */
export declare function register(req: Request, res: Response): Promise<void>;
/**
 * Login with email and password
 */
export declare function login(req: Request, res: Response): Promise<void>;
/**
 * Refresh access token using refresh token
 */
export declare function refreshToken(req: Request, res: Response): Promise<void>;
/**
 * Logout - invalidate refresh token
 */
export declare function logout(req: Request, res: Response): Promise<void>;
/**
 * Get current user profile
 */
export declare function getProfile(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=authController.d.ts.map