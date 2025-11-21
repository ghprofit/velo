/**
 * Generate a secure verification token
 */
export declare const generateVerificationToken: () => string;
/**
 * Generate a 6-digit verification code
 */
export declare const generateVerificationCode: () => string;
/**
 * Create email verification token in database
 */
export declare const createEmailVerificationToken: (userId: string) => Promise<string>;
/**
 * Verify email verification token
 */
export declare const verifyEmailToken: (token: string) => Promise<{
    userId: string;
} | null>;
/**
 * Mark user's email as verified
 */
export declare const markEmailAsVerified: (userId: string) => Promise<void>;
/**
 * Send verification email to user
 */
export declare const sendVerificationEmail: (email: string, displayName: string, token: string) => Promise<boolean>;
/**
 * Send welcome email after successful verification
 */
export declare const sendWelcomeEmail: (email: string, displayName: string) => Promise<boolean>;
declare const _default: {
    generateVerificationToken: () => string;
    generateVerificationCode: () => string;
    createEmailVerificationToken: (userId: string) => Promise<string>;
    verifyEmailToken: (token: string) => Promise<{
        userId: string;
    } | null>;
    markEmailAsVerified: (userId: string) => Promise<void>;
    sendVerificationEmail: (email: string, displayName: string, token: string) => Promise<boolean>;
    sendWelcomeEmail: (email: string, displayName: string) => Promise<boolean>;
};
export default _default;
//# sourceMappingURL=emailService.d.ts.map