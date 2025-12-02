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
  window?: number; // Time window for token validation (default: 1)
  step?: number; // Time step in seconds (default: 30)
}
