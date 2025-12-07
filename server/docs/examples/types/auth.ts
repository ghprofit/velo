// types/auth.ts

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'CREATOR';
  emailVerified: boolean;
  creatorProfile?: CreatorProfile;
}

export interface CreatorProfile {
  id: string;
  displayName: string;
  profileImage?: string;
  verificationStatus: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user?: User;
  tokens?: AuthTokens;
  requiresTwoFactor?: boolean;
  tempToken?: string;
  message?: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export interface TwoFactorEnableResponse {
  enabled: boolean;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  hasSecret: boolean;
}

export interface Session {
  id: string;
  deviceName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Enable2FAFormData {
  secret: string;
  token: string;
}

export interface Verify2FAFormData {
  tempToken: string;
  token: string;
}

export interface Disable2FAFormData {
  token: string;
}
