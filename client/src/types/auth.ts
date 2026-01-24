// types/auth.ts

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'CREATOR' | 'SUPPORT' | 'SUPER_ADMIN';
  emailVerified: boolean;
  adminRole?: 'FINANCIAL_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_SPECIALIST' | 'ANALYTICS_ADMIN' | null;
  creatorProfile?: CreatorProfile;
  adminProfile?: AdminProfile;
}

export interface AdminProfile {
  id: string;
  fullName: string;
  adminRole: 'FINANCIAL_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_SPECIALIST' | 'ANALYTICS_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
  twoFactorEnabled?: boolean;
}

export interface CreatorProfile {
  id: string;
  displayName: string;
  profileImage?: string;
  verificationStatus: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  veriffSessionId?: string | null;
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

export interface ApiResponse<T = unknown> {
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

// Veriff KYC Types
export interface VeriffSessionResponse {
  sessionId: string;
  verificationUrl: string;
  status?: string;
}

export interface VeriffPersonData {
  firstName?: string;
  lastName?: string;
  idNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
}

export interface VeriffDocumentData {
  number?: string;
  type?: string;
  country?: string;
  validFrom?: string;
  validUntil?: string;
}

export interface VeriffVerificationStatus {
  id: string;
  code: number;
  status?: string;
  reason?: string;
  reasonCode?: number;
  person?: VeriffPersonData;
  document?: VeriffDocumentData;
  decisionTime?: string;
  acceptanceTime?: string;
}

export interface VeriffStatusResponse {
  status: string;
  verification: VeriffVerificationStatus;
}
