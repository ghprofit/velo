export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
/**
 * Hash password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare password with hashed password
 */
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
/**
 * Generate JWT access token
 */
export declare function generateAccessToken(payload: JWTPayload): string;
/**
 * Generate JWT refresh token
 */
export declare function generateRefreshToken(payload: JWTPayload): string;
/**
 * Generate both access and refresh tokens
 */
export declare function generateTokenPair(payload: JWTPayload): TokenPair;
/**
 * Verify JWT access token
 */
export declare function verifyAccessToken(token: string): JWTPayload | null;
/**
 * Verify JWT refresh token
 */
export declare function verifyRefreshToken(token: string): JWTPayload | null;
/**
 * Generate unique session token for anonymous buyers
 */
export declare function generateSessionToken(): string;
/**
 * Generate unique access token for purchased content
 */
export declare function generateAccessTokenForContent(): string;
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export declare function isValidPassword(password: string): boolean;
/**
 * Get password validation errors
 */
export declare function getPasswordErrors(password: string): string[];
/**
 * Calculate refresh token expiration date
 */
export declare function getRefreshTokenExpiration(): Date;
/**
 * Calculate buyer session expiration date
 */
export declare function getBuyerSessionExpiration(): Date;
//# sourceMappingURL=auth.d.ts.map