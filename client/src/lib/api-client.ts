// lib/api-client.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds (increased from 30)
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add auth token to requests and adjust timeouts
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage (or cookies in production)
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Increase timeout for content upload endpoints (large video files with base64 encoding)
    if (config.url?.includes('/content') && config.method === 'post') {
      config.timeout = 300000; // 5 minutes for video/image uploads
    }

    // Increase timeout for payment-related endpoints
    if (
      config.url?.includes('/purchase') ||
      config.url?.includes('/stripe') ||
      config.url?.includes('/confirm')
    ) {
      config.timeout = 90000; // 90 seconds for payment operations
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh endpoint to avoid infinite loop
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Refresh token is invalid, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token, logout
        localStorage.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;

        // Update tokens in storage
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Notify Context/Redux of token refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth-token-refreshed', {
              detail: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              },
            })
          );
        }

        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

// Helper functions for common API calls
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    displayName: string;
    firstName: string;
    lastName: string;
    country: string;
  }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  getProfile: () => apiClient.get('/auth/profile'),

  verifyEmail: (code: string) =>
    apiClient.post('/auth/verify-email-code', { code }),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-verification', { email }),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword }),

  // 2FA endpoints
  setup2FA: () => apiClient.post('/auth/2fa/setup'),

  enable2FA: (secret: string, token: string) =>
    apiClient.post('/auth/2fa/enable', { secret, token }),

  verify2FA: (tempToken: string, token: string) =>
    apiClient.post('/auth/2fa/verify', { tempToken, token }),

  disable2FA: (token: string) =>
    apiClient.post('/auth/2fa/disable', { token }),

  get2FAStatus: () => apiClient.get('/auth/2fa/status'),

  regenerateBackupCodes: (token: string) =>
    apiClient.post('/auth/2fa/backup-codes/regenerate', { token }),

  verifyBackupCode: (tempToken: string, backupCode: string) =>
    apiClient.post('/auth/2fa/verify-backup', { tempToken, backupCode }),

  // Session management
  getSessions: () => apiClient.get('/auth/sessions'),

  revokeSession: (sessionId: string) =>
    apiClient.delete(`/auth/sessions/${sessionId}`),

  revokeAllSessions: (currentSessionId?: string) =>
    apiClient.delete('/auth/sessions', { data: { currentSessionId } }),

  // Profile & Settings
  updateProfile: (data: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => apiClient.post('/auth/profile/update', data),

  getNotificationPreferences: () => apiClient.get('/auth/notifications/preferences'),

  updateNotificationPreferences: (data: {
    payoutUpdates?: boolean;
    contentEngagement?: boolean;
    platformAnnouncements?: boolean;
    marketingEmails?: boolean;
  }) => apiClient.post('/auth/notifications/preferences', data),

  deactivateAccount: (password: string) =>
    apiClient.post('/auth/account/deactivate', { password }),

  deleteAccount: (password: string, confirmation: string) =>
    apiClient.delete('/auth/account', { data: { password, confirmation } }),
};

// Veriff KYC verification API
export const veriffApi = {
  // Initiate identity verification for creator
  initiateVerification: () =>
    apiClient.post('/creators/verify/initiate'),

  // Get verification status by session ID
  getVerificationStatus: (sessionId: string) =>
    apiClient.get(`/veriff/sessions/${sessionId}/decision`),

  // Get current user's verification status
  getMyVerificationStatus: () =>
    apiClient.get('/creators/verify/status'),

  // Resubmit verification if required
  resubmitVerification: (sessionId: string) =>
    apiClient.patch(`/veriff/sessions/${sessionId}`),

  // Cancel verification session
  cancelVerification: (sessionId: string) =>
    apiClient.delete(`/veriff/sessions/${sessionId}`),
};

// Bank account payout API
export const payoutApi = {
  // Setup bank account for payout
  setupBankAccount: (data: {
    bankAccountName: string;
    bankName: string;
    bankAccountNumber: string;
    bankRoutingNumber?: string;
    bankSwiftCode?: string;
    bankIban?: string;
    bankCountry: string;
    bankCurrency?: string;
  }) =>
    apiClient.post('/creators/payout/setup', data),

  // Get current bank account info
  getBankAccountInfo: () =>
    apiClient.get('/creators/payout/info'),

  // Delete bank account
  deleteBankAccount: () =>
    apiClient.delete('/creators/payout/info'),
};

// Content management API
export const contentApi = {
  // Create new content
  createContent: (data: {
    title: string;
    description?: string;
    price: number;
    contentType: string;
    items: Array<{
      fileData: string;
      fileName: string;
      contentType: string;
      fileSize: number;
      duration?: number;
    }>;
    thumbnailData: string;
  }) =>
    apiClient.post('/content', data),

  // Create new content using multipart/form-data (streaming)
  createContentMultipart: (formData: FormData, onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void) =>
    apiClient.post('/content/multipart', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes for large uploads
      onUploadProgress,
    }),

  // Get presigned S3 upload URLs (bypasses API Gateway 10MB limit)
  getUploadUrls: (data: {
    title: string;
    description: string;
    category?: string;
    price: number;
    thumbnailFileName: string;
    thumbnailContentType: string;
    thumbnailFileSize: number;
    contentFiles: Array<{
      fileName: string;
      contentType: string;
      fileSize: number;
      type: 'IMAGE' | 'VIDEO';
    }>;
  }) =>
    apiClient.post('/content/upload-urls', data),

  // Confirm direct S3 upload completion
  confirmUpload: (data: {
    contentId: string;
    title: string;
    description: string;
    category?: string;
    price: number;
    thumbnailS3Key: string;
    items: Array<{
      s3Key: string;
      type: string;
      fileSize: number;
    }>;
  }) =>
    apiClient.post('/content/confirm-upload', data),

  // Get creator's content
  getMyContent: () =>
    apiClient.get('/content/my-content'),

  // Get content stats
  getContentStats: () =>
    apiClient.get('/content/stats'),

  // Get content by ID
  getContentById: (id: string) =>
    apiClient.get(`/content/${id}`),

  // Delete content
  deleteContent: (id: string) =>
    apiClient.delete(`/content/${id}`),
};

// Support ticket API
export const supportApi = {
  // Create support ticket
  createTicket: (data: {
    category: string;
    subject: string;
    description: string;
    contentId?: string;
    email: string;
    attachments?: Array<{
      fileData: string;
      fileName: string;
      contentType: string;
      fileSize: number;
    }>;
  }) =>
    apiClient.post('/support/tickets', data),

  // Get user's support tickets
  getMyTickets: () =>
    apiClient.get('/support/tickets'),

  // Get ticket by ID
  getTicketById: (id: string) =>
    apiClient.get(`/support/tickets/${id}`),
};

// Analytics API
export const analyticsApi = {
  // Get overview stats
  getOverview: (period?: string) =>
    apiClient.get('/analytics/overview', { params: { period } }),

  // Get performance trends
  getTrends: (period?: string, metric?: string) =>
    apiClient.get('/analytics/trends', { params: { period, metric } }),

  // Get content performance
  getContentPerformance: (page?: number, limit?: number, search?: string) =>
    apiClient.get('/analytics/content-performance', {
      params: { page, limit, search },
    }),

  // Get complete demographics data
  getDemographics: (period?: string) =>
    apiClient.get('/analytics/demographics', { params: { period } }),

  // Get geographic distribution
  getGeographicDistribution: (period?: string) =>
    apiClient.get('/analytics/demographics/geographic', { params: { period } }),

  // Get device distribution
  getDeviceDistribution: (period?: string) =>
    apiClient.get('/analytics/demographics/devices', { params: { period } }),

  // Get browser distribution
  getBrowserDistribution: (period?: string) =>
    apiClient.get('/analytics/demographics/browsers', { params: { period } }),

  // Record content view (for tracking)
  recordView: (contentId: string, viewData?: {
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  }) =>
    apiClient.post(`/analytics/view/${contentId}`, viewData || {}),
};

// Earnings API
export const earningsApi = {
  // Get balance
  getBalance: () =>
    apiClient.get('/earnings/balance'),

  // Get payouts
  getPayouts: (page?: number, limit?: number) =>
    apiClient.get('/earnings/payouts', { params: { page, limit } }),

  // Get transactions
  getTransactions: (page?: number, limit?: number, type?: string, search?: string) =>
    apiClient.get('/earnings/transactions', { params: { page, limit, type, search } }),

  // Request payout
  requestPayout: (amount: number, notes?: string) =>
    apiClient.post('/creators/payout/request', { amount, notes }),

  // Get payout requests
  getPayoutRequests: () =>
    apiClient.get('/creators/payout/requests'),

  // Get payout request by ID
  getPayoutRequestById: (id: string) =>
    apiClient.get(`/creators/payout/requests/${id}`),
};

// Notifications API
export const notificationsApi = {
  // Get notifications
  getNotifications: (category?: string) =>
    apiClient.get('/notifications', { params: { category } }),

  // Get stats
  getStats: () =>
    apiClient.get('/notifications/stats'),

  // Mark as read
  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),

  // Delete notification
  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),

  // Clear all read
  clearAllRead: () =>
    apiClient.delete('/notifications/read'),
};

// Buyer/Public API (for anonymous buyers)
export const buyerApi = {
  // Create or get buyer session
  createSession: (data: { fingerprint?: string; email?: string }) =>
    apiClient.post('/buyer/session', data),

  // Get content details (public)
  getContentDetails: (id: string) =>
    apiClient.get(`/buyer/content/${id}`),

  // Create a purchase
  createPurchase: (data: {
    contentId: string;
    sessionToken: string;
    email: string;  // REQUIRED - for invoice sending
    fingerprint?: string;
  }) =>
    apiClient.post('/buyer/purchase', data),

  // Verify purchase status
  verifyPurchase: (id: string) =>
    apiClient.get(`/buyer/purchase/${id}`),

  // Get content access after purchase
  getContentAccess: (accessToken: string, fingerprint: string) =>
    apiClient.post('/buyer/access', { accessToken, fingerprint }),

  // Check access eligibility before loading content
  checkAccessEligibility: (accessToken: string, fingerprint: string) =>
    apiClient.post('/buyer/access/check-eligibility', { accessToken, fingerprint }),

  // Request device verification code
  requestDeviceVerification: (data: {
    accessToken: string;
    fingerprint: string;
    email: string;
  }) =>
    apiClient.post('/buyer/access/request-device-verification', data),

  // Verify device code
  verifyDeviceCode: (data: {
    accessToken: string;
    fingerprint: string;
    verificationCode: string;
  }) =>
    apiClient.post('/buyer/access/verify-device', data),

  // Get all purchases for a session
  getSessionPurchases: (sessionToken: string) =>
    apiClient.get(`/buyer/session/${sessionToken}/purchases`),

  // Confirm purchase after payment success
  confirmPurchase: (data: { purchaseId: string; paymentIntentId: string }) =>
    apiClient.post('/buyer/purchase/confirm', data),
};

// Stripe API
export const stripeApi = {
  // Get Stripe publishable key
  getConfig: () =>
    apiClient.get('/stripe/config'),
};

// Admin API
export const adminApi = {
  // Payout request management
  getPayoutRequests: (query?: {
    status?: string;
    creatorId?: string;
    page?: number;
    limit?: number;
  }) =>
    apiClient.get('/admin/payments/payout-requests', { params: query }),

  getPayoutRequestDetails: (requestId: string) =>
    apiClient.get(`/admin/payments/payout-requests/${requestId}`),

  approvePayoutRequest: (data: { requestId: string; reviewNotes?: string }) =>
    apiClient.post('/admin/payments/payout-requests/approve', data),

  rejectPayoutRequest: (data: { requestId: string; reviewNotes: string }) =>
    apiClient.post('/admin/payments/payout-requests/reject', data),
};

export default apiClient;
