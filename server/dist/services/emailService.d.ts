export declare const generateVerificationToken: () => string;
export declare const generateVerificationCode: () => string;
export declare const createEmailVerificationToken: (userId: string) => Promise<string>;
export declare const verifyEmailToken: (token: string) => Promise<{
    userId: string;
} | null>;
export declare const markEmailAsVerified: (userId: string) => Promise<void>;
export declare const sendVerificationEmail: (email: string, displayName: string, token: string) => Promise<boolean>;
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