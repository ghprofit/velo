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
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
export declare function generateAccessToken(payload: JWTPayload): string;
export declare function generateRefreshToken(payload: JWTPayload): string;
export declare function generateTokenPair(payload: JWTPayload): TokenPair;
export declare function verifyAccessToken(token: string): JWTPayload | null;
export declare function verifyRefreshToken(token: string): JWTPayload | null;
export declare function generateSessionToken(): string;
export declare function generateAccessTokenForContent(): string;
export declare function isValidEmail(email: string): boolean;
export declare function isValidPassword(password: string): boolean;
export declare function getPasswordErrors(password: string): string[];
export declare function getRefreshTokenExpiration(): Date;
export declare function getBuyerSessionExpiration(): Date;
//# sourceMappingURL=auth.d.ts.map