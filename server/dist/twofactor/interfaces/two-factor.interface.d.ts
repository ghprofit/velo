export interface TwoFactorSecret {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url?: string;
}
export interface User2FAData {
    userId: string;
    secret: string;
    enabled: boolean;
    backupCodes?: string[];
    createdAt?: Date;
    enabledAt?: Date;
}
export interface TwoFactorConfig {
    appName: string;
    window?: number;
    step?: number;
}
//# sourceMappingURL=two-factor.interface.d.ts.map