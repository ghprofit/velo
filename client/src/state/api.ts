import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types for API responses
interface User {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
    creatorProfile?: {
        id: string;
        displayName: string;
        verificationStatus: string;
    };
}

interface Tokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        tokens: Tokens;
    };
}

interface RegisterRequest {
    email: string;
    password: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    country?: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface VerifyEmailResponse {
    success: boolean;
    message: string;
    data?: {
        userId: string;
        email: string;
        emailVerified: boolean;
        alreadyVerified?: boolean;
    };
}

interface ResendVerificationResponse {
    success: boolean;
    message: string;
    data?: {
        email: string;
        retryAfter?: number;
    };
}

interface VeriffInitiateResponse {
    success: boolean;
    message: string;
    data?: {
        sessionId: string;
        verificationUrl: string;
    };
}

interface VeriffStatusResponse {
    success: boolean;
    message: string;
    data?: {
        status: string;
        verificationStatus: string;
        verifiedAt?: string;
    };
}

// Admin Management Types
interface AdminPermissions {
    dashboard: boolean;
    creatorManagement: boolean;
    contentReview: boolean;
    financialReports: boolean;
    systemSettings: boolean;
    supportTickets: boolean;
}

interface Admin {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
    isActive: boolean;
    permissions: AdminPermissions;
    twoFactorEnabled: boolean;
    lastPasswordReset?: string;
    createdAt: string;
}

interface AdminListResponse {
    success: boolean;
    data: Admin[];
}

interface AdminResponse {
    success: boolean;
    message?: string;
    data: Admin;
}

interface CreateAdminRequest {
    fullName: string;
    email: string;
    password: string;
    role: 'FINANCIAL_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_SPECIALIST' | 'ANALYTICS_ADMIN';
}

interface UpdateAdminRequest {
    fullName?: string;
    role?: 'FINANCIAL_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_SPECIALIST' | 'ANALYTICS_ADMIN';
    status?: 'ACTIVE' | 'SUSPENDED' | 'INVITED';
    isActive?: boolean;
    permissions?: Partial<AdminPermissions>;
}

// Creator Management Types
interface Creator {
    id: string;
    name: string;
    email: string;
    kycStatus: string;
    payoutStatus: string;
    policyStrikes: number;
    lifetimeEarnings: number;
    lastLogin: string;
    isActive: boolean;
    createdAt: string;
}

interface CreatorListResponse {
    success: boolean;
    data: Creator[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface CreatorResponse {
    success: boolean;
    message?: string;
    data: Creator;
}

interface CreatorStatsResponse {
    success: boolean;
    data: {
        totalCreators: number;
        payoutOnHold: number;
        kycPendingOrFailed: number;
        highStrikes: number;
    };
}

interface QueryCreatorsParams {
    search?: string;
    kycStatus?: string;
    payoutStatus?: string;
    strikes?: string;
    page?: number;
    limit?: number;
}

interface UpdateCreatorRequest {
    displayName?: string;
    payoutStatus?: 'ACTIVE' | 'ON_HOLD' | 'SUSPENDED';
    verificationStatus?: 'PENDING' | 'IN_PROGRESS' | 'VERIFIED' | 'REJECTED';
    policyStrikes?: number;
    verificationNotes?: string;
}

// Content Management Types
interface Content {
    id: string;
    title: string;
    description?: string;
    creatorName: string;
    creatorId: string;
    contentType: string;
    thumbnailUrl: string;
    price: number;
    status: string;
    complianceStatus: string;
    complianceNotes?: string;
    isPublished: boolean;
    viewCount: number;
    purchaseCount: number;
    totalRevenue: number;
    createdAt: string;
    publishedAt?: string;
}

interface ContentListResponse {
    success: boolean;
    data: Content[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface ContentResponse {
    success: boolean;
    message?: string;
    data: Content;
}

interface ContentStatsResponse {
    success: boolean;
    data: {
        totalContent: number;
        pendingReview: number;
        flagged: number;
        approved: number;
        rejected: number;
        highSeverity: number;
    };
}

interface QueryContentParams {
    search?: string;
    status?: string;
    complianceStatus?: string;
    contentType?: string;
    severity?: string;
    page?: number;
    limit?: number;
}

// Financial Reports Types
interface FinancialOverview {
    totalRevenue: number;
    totalPayouts: number;
    platformRevenue: number;
    pendingPayoutsAmount: number;
    pendingPayoutsCount: number;
    totalTransactions: number;
    avgTransactionValue: number;
    topCreators: Array<{
        id: string;
        name: string;
        email: string;
        totalEarnings: number;
    }>;
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
}

interface RevenueTransaction {
    id: string;
    amount: number;
    currency: string;
    paymentProvider: string;
    transactionId?: string;
    status: string;
    createdAt: Date;
    content: {
        id: string;
        title: string;
        price: number;
    };
    creator: {
        id: string;
        name: string;
        email: string;
    };
}

interface RevenueReportResponse {
    data: RevenueTransaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface PayoutRecord {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    paymentId?: string;
    processedAt?: Date;
    notes?: string;
    createdAt: Date;
    creator: {
        id: string;
        name: string;
        email: string;
        paypalEmail?: string;
        stripeAccountId?: string;
    };
}

interface PayoutReportResponse {
    data: PayoutRecord[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface RevenueAnalytics {
    dailyRevenue: Array<{
        date: Date;
        revenue: number;
        transactions: number;
    }>;
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
}

interface PayoutStats {
    pending: { count: number; amount: number };
    processing: { count: number; amount: number };
    completed: { count: number; amount: number };
    failed: { count: number; amount: number };
}

interface CreatorEarnings {
    id: string;
    name: string;
    email: string;
    totalEarnings: number;
    totalPurchases: number;
    payoutStatus: string;
    totalPayouts: number;
}

interface CreatorEarningsResponse {
    data: CreatorEarnings[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface QueryFinancialReportsParams {
    reportType?: 'REVENUE' | 'PAYOUTS' | 'TRANSACTIONS' | 'OVERVIEW';
    timeRange?: 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM';
    startDate?: string;
    endDate?: string;
    creatorId?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Settings Types
interface PlatformSetting {
    id: string;
    key: string;
    value: string;
    description?: string;
    category: 'general' | 'payments' | 'content' | 'security';
    isPublic: boolean;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface AllSettingsResponse {
    settings: PlatformSetting[];
    grouped: Record<string, PlatformSetting[]>;
    total: number;
}

interface BulkUpdateSettingsRequest {
    updates: Array<{
        key: string;
        value: string;
    }>;
}

interface UpdateContentRequest {
    status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'REMOVED';
    complianceStatus?: 'PENDING' | 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';
    complianceNotes?: string;
    isPublished?: boolean;
}

interface ReviewContentRequest {
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
    notes?: string;
    reason?: string;
}

interface RemoveContentRequest {
    reason: string;
    notifyCreator?: boolean;
}

// Admin Dashboard Types
interface DashboardStats {
    totalCreators: number;
    activeCreators: number;
    inactiveCreators: number;
    totalEarnings: number;
    transactionsToday: number;
}

interface RevenueDataPoint {
    date: string;
    amount: number;
}

interface RevenueData {
    data: RevenueDataPoint[];
    period: string;
}

interface RecentActivity {
    id: string;
    creator: string;
    activity: string;
    date: string;
    status: string;
    statusColor: string;
}

interface RecentActivityResponse {
    data: RecentActivity[];
}

// Admin Creators Types
interface AdminCreator {
    id: string;
    name: string;
    email: string;
    kycStatus: string;
    accountStatus: string;
    joinDate: string;
    lastLogin: string | null;
    isActive: boolean;
    totalEarnings: number;
    totalViews: number;
    totalPurchases: number;
}

interface AdminCreatorListResponse {
    success: boolean;
    data: AdminCreator[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface AdminCreatorStatsResponse {
    success: boolean;
    data: {
        totalCreators: number;
        activeCreators: number;
        suspendedCreators: number;
        kycPending: number;
        kycVerified: number;
        kycFailed: number;
    };
}

interface AdminCreatorDetailsResponse {
    success: boolean;
    data: AdminCreator & {
        bio?: string;
        profileImage?: string;
        coverImage?: string;
        payoutStatus: string;
        policyStrikes: number;
        recentContent: any[];
        recentPayouts: any[];
    };
}

interface QueryAdminCreatorsParams {
    search?: string;
    kycStatus?: string;
    accountStatus?: string;
    page?: number;
    limit?: number;
}

interface AdminContent {
    id: string;
    title: string;
    description?: string;
    status: string;
    price: number;
    mediaType: string;
    createdAt: string;
    updatedAt: string;
    creator: {
        id: string;
        name: string;
        email: string;
    };
}

interface AdminContentListResponse {
    success: boolean;
    data: AdminContent[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface AdminContentStatsResponse {
    success: boolean;
    data: {
        totalContent: number;
        pendingReview: number;
        approved: number;
        rejected: number;
        flagged: number;
    };
}

interface AdminContentDetailsResponse {
    success: boolean;
    data: AdminContent & {
        s3Key?: string;
        s3Bucket?: string;
        thumbnailUrl?: string;
        recentPurchases: any[];
    };
}

interface QueryAdminContentParams {
    search?: string;
    status?: string;
    creatorId?: string;
    page?: number;
    limit?: number;
}

interface ReviewContentRequest {
    status: 'APPROVED' | 'REJECTED';
    reason?: string;
}

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as { auth?: { tokens?: { accessToken?: string } } };
            const token = state.auth?.tokens?.accessToken;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    reducerPath: "api",
    tagTypes: ["Auth", "User", "Admin", "Creator", "Content", "Settings", "Dashboard"],
    endpoints: (build) => ({
        registerUser: build.mutation<AuthResponse, RegisterRequest>({
            query: (data) => ({
                url: '/api/auth/register',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),
        loginUser: build.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/api/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        refreshToken: build.mutation({
            query: (refreshToken: string) => ({
                url: '/api/auth/refresh',
                method: 'POST',
                body: { refreshToken },
            }),
        }),
        logoutUser: build.mutation({
            query: (refreshToken: string) => ({
                url: '/api/auth/logout',
                method: 'POST',
                body: { refreshToken },
            }),
            invalidatesTags: ['Auth'],
        }),
        getUserProfile: build.query({
            query: () => '/api/auth/profile',
            providesTags: ['Auth'],
        }),
        // Email verification endpoints
        verifyEmail: build.mutation<VerifyEmailResponse, string>({
            query: (token) => ({
                url: `/api/auth/verify-email/${token}`,
                method: 'GET',
            }),
        }),
        resendVerificationEmail: build.mutation<ResendVerificationResponse, void>({
            query: () => ({
                url: '/api/auth/resend-verification',
                method: 'POST',
            }),
        }),
        // Veriff endpoints
        initiateVerification: build.mutation<VeriffInitiateResponse, void>({
            query: () => ({
                url: '/api/verification/initiate',
                method: 'POST',
            }),
        }),
        getVerificationStatus: build.query<VeriffStatusResponse, void>({
            query: () => '/api/verification/status',
        }),
        // Superadmin endpoints
        getAdmins: build.query<AdminListResponse, { search?: string; role?: string }>({
            query: ({ search, role } = {}) => {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (role && role !== 'all') params.append('role', role);
                return `/api/superadmin/admins?${params.toString()}`;
            },
            providesTags: ['Admin'],
        }),
        getAdminById: build.query<AdminResponse, string>({
            query: (id) => `/api/superadmin/admins/${id}`,
            providesTags: ['Admin'],
        }),
        createAdmin: build.mutation<AdminResponse, CreateAdminRequest>({
            query: (data) => ({
                url: '/api/superadmin/admins',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Admin'],
        }),
        updateAdmin: build.mutation<AdminResponse, { id: string; data: UpdateAdminRequest }>({
            query: ({ id, data }) => ({
                url: `/api/superadmin/admins/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Admin'],
        }),
        deleteAdmin: build.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/api/superadmin/admins/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Admin'],
        }),
        forcePasswordReset: build.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/api/superadmin/admins/${id}/force-password-reset`,
                method: 'POST',
            }),
        }),
        getAdminActivity: build.query<{ success: boolean; data: unknown[] }, string>({
            query: (id) => `/api/superadmin/admins/${id}/activity`,
        }),
        // Creator management endpoints
        getCreators: build.query<CreatorListResponse, QueryCreatorsParams>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.search) searchParams.append('search', params.search);
                if (params.kycStatus && params.kycStatus !== 'all') searchParams.append('kycStatus', params.kycStatus);
                if (params.payoutStatus && params.payoutStatus !== 'all') searchParams.append('payoutStatus', params.payoutStatus);
                if (params.strikes && params.strikes !== 'all') searchParams.append('strikes', params.strikes);
                if (params.page) searchParams.append('page', params.page.toString());
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/api/superadmin/creators?${searchParams.toString()}`;
            },
            providesTags: ['Creator'],
        }),
        getCreatorStats: build.query<CreatorStatsResponse, void>({
            query: () => '/api/superadmin/creators/stats',
            providesTags: ['Creator'],
        }),
        getCreatorById: build.query<{ success: boolean; data: Creator & { profile: unknown; stats: unknown } }, string>({
            query: (id) => `/api/superadmin/creators/${id}`,
            providesTags: ['Creator'],
        }),
        updateCreator: build.mutation<CreatorResponse, { id: string; data: UpdateCreatorRequest }>({
            query: ({ id, data }) => ({
                url: `/api/superadmin/creators/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Creator'],
        }),
        addCreatorStrike: build.mutation<CreatorResponse, { id: string; reason: string }>({
            query: ({ id, reason }) => ({
                url: `/api/superadmin/creators/${id}/strike`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Creator'],
        }),
        suspendCreator: build.mutation<CreatorResponse, { id: string; reason: string }>({
            query: ({ id, reason }) => ({
                url: `/api/superadmin/creators/${id}/suspend`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Creator'],
        }),
        reactivateCreator: build.mutation<CreatorResponse, string>({
            query: (id) => ({
                url: `/api/superadmin/creators/${id}/reactivate`,
                method: 'POST',
            }),
            invalidatesTags: ['Creator'],
        }),
        // Content management endpoints
        getContent: build.query<ContentListResponse, QueryContentParams>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.search) searchParams.append('search', params.search);
                if (params.status && params.status !== 'all') searchParams.append('status', params.status);
                if (params.complianceStatus && params.complianceStatus !== 'all') searchParams.append('complianceStatus', params.complianceStatus);
                if (params.contentType && params.contentType !== 'all') searchParams.append('contentType', params.contentType);
                if (params.severity && params.severity !== 'all') searchParams.append('severity', params.severity);
                if (params.page) searchParams.append('page', params.page.toString());
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/api/superadmin/content?${searchParams.toString()}`;
            },
            providesTags: ['Content'],
        }),
        getContentStats: build.query<ContentStatsResponse, void>({
            query: () => '/api/superadmin/content/stats',
            providesTags: ['Content'],
        }),
        getContentById: build.query<ContentResponse, string>({
            query: (id) => `/api/superadmin/content/${id}`,
            providesTags: ['Content'],
        }),
        updateContent: build.mutation<ContentResponse, { id: string; data: UpdateContentRequest }>({
            query: ({ id, data }) => ({
                url: `/api/superadmin/content/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Content'],
        }),
        reviewContent: build.mutation<ContentResponse, { id: string; data: ReviewContentRequest }>({
            query: ({ id, data }) => ({
                url: `/api/superadmin/content/${id}/review`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Content'],
        }),
        removeContent: build.mutation<ContentResponse, { id: string; data: RemoveContentRequest }>({
            query: ({ id, data }) => ({
                url: `/api/superadmin/content/${id}/remove`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Content'],
        }),

        // Financial Reports endpoints
        getFinancialOverview: build.query<FinancialOverview, QueryFinancialReportsParams>({
            query: (params) => ({
                url: '/api/superadmin/financial-reports/overview',
                params,
            }),
        }),
        getRevenueReport: build.query<RevenueReportResponse, QueryFinancialReportsParams>({
            query: (params) => ({
                url: '/api/superadmin/financial-reports/revenue',
                params,
            }),
        }),
        getPayoutReport: build.query<PayoutReportResponse, QueryFinancialReportsParams>({
            query: (params) => ({
                url: '/api/superadmin/financial-reports/payouts',
                params,
            }),
        }),
        getRevenueAnalytics: build.query<RevenueAnalytics, QueryFinancialReportsParams>({
            query: (params) => ({
                url: '/api/superadmin/financial-reports/analytics',
                params,
            }),
        }),
        getPayoutStats: build.query<PayoutStats, void>({
            query: () => '/api/superadmin/financial-reports/payout-stats',
        }),
        getCreatorEarnings: build.query<CreatorEarningsResponse, QueryFinancialReportsParams>({
            query: (params) => ({
                url: '/api/superadmin/financial-reports/creator-earnings',
                params,
            }),
        }),

        // Settings endpoints
        getAllSettings: build.query<AllSettingsResponse, string | void>({
            query: (category) => ({
                url: '/api/superadmin/settings',
                params: category ? { category } : undefined,
            }),
            providesTags: ['Settings'],
        }),
        getPublicSettings: build.query<Record<string, string>, void>({
            query: () => '/api/superadmin/settings/public',
        }),
        getSetting: build.query<PlatformSetting, string>({
            query: (key) => `/api/superadmin/settings/${key}`,
            providesTags: ['Settings'],
        }),
        bulkUpdateSettings: build.mutation<AllSettingsResponse, BulkUpdateSettingsRequest>({
            query: (data) => ({
                url: '/api/superadmin/settings/bulk',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),
        initializeSettings: build.mutation<{ message: string }, void>({
            query: () => ({
                url: '/api/superadmin/settings/initialize',
                method: 'POST',
            }),
            invalidatesTags: ['Settings'],
        }),
        resetSettingsToDefaults: build.mutation<AllSettingsResponse, void>({
            query: () => ({
                url: '/api/superadmin/settings/reset',
                method: 'POST',
            }),
            invalidatesTags: ['Settings'],
        }),

        // Admin Dashboard endpoints
        getDashboardStats: build.query<DashboardStats, void>({
            query: () => '/api/admin/dashboard/stats',
            providesTags: ['Dashboard'],
        }),
        getRevenueOverTime: build.query<RevenueData, { period?: '7' | '30' | '90' }>({
            query: ({ period = '30' } = {}) => ({
                url: '/api/admin/dashboard/revenue',
                params: { period },
            }),
            providesTags: ['Dashboard'],
        }),
        getRecentActivity: build.query<RecentActivityResponse, void>({
            query: () => '/api/admin/dashboard/activity',
            providesTags: ['Dashboard'],
        }),

        // Admin Creators endpoints
        getAdminCreators: build.query<AdminCreatorListResponse, QueryAdminCreatorsParams>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.search) searchParams.append('search', params.search);
                if (params.kycStatus && params.kycStatus !== 'all') searchParams.append('kycStatus', params.kycStatus);
                if (params.accountStatus && params.accountStatus !== 'all') searchParams.append('accountStatus', params.accountStatus);
                if (params.page) searchParams.append('page', params.page.toString());
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/api/admin/creators?${searchParams.toString()}`;
            },
            providesTags: ['Creator'],
        }),
        getAdminCreatorStats: build.query<AdminCreatorStatsResponse, void>({
            query: () => '/api/admin/creators/stats',
            providesTags: ['Creator'],
        }),
        getAdminCreatorById: build.query<AdminCreatorDetailsResponse, string>({
            query: (id) => `/api/admin/creators/${id}`,
            providesTags: ['Creator'],
        }),

        // Admin Content endpoints
        getAdminContent: build.query<AdminContentListResponse, QueryAdminContentParams>({
            query: (params) => ({
                url: '/api/admin/content',
                params,
            }),
            providesTags: ['Content'],
        }),
        getAdminContentStats: build.query<AdminContentStatsResponse, void>({
            query: () => '/api/admin/content/stats',
            providesTags: ['Content'],
        }),
        getAdminContentById: build.query<AdminContentDetailsResponse, string>({
            query: (id) => `/api/admin/content/${id}`,
            providesTags: ['Content'],
        }),
        reviewContent: build.mutation<{ success: boolean; message: string }, { id: string; data: ReviewContentRequest }>({
            query: ({ id, data }) => ({
                url: `/api/admin/content/${id}/review`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Content'],
        }),
        flagContent: build.mutation<{ success: boolean; message: string }, { id: string; reason: string }>({
            query: ({ id, reason }) => ({
                url: `/api/admin/content/${id}/flag`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Content'],
        }),
        removeContent: build.mutation<{ success: boolean; message: string }, { id: string; reason: string }>({
            query: ({ id, reason }) => ({
                url: `/api/admin/content/${id}/remove`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Content'],
        }),
    }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useRefreshTokenMutation,
    useLogoutUserMutation,
    useGetUserProfileQuery,
    useVerifyEmailMutation,
    useResendVerificationEmailMutation,
    useInitiateVerificationMutation,
    useGetVerificationStatusQuery,
    // Superadmin admin hooks
    useGetAdminsQuery,
    useGetAdminByIdQuery,
    useCreateAdminMutation,
    useUpdateAdminMutation,
    useDeleteAdminMutation,
    useForcePasswordResetMutation,
    useGetAdminActivityQuery,
    // Superadmin creator hooks
    useGetCreatorsQuery,
    useGetCreatorStatsQuery,
    useGetCreatorByIdQuery,
    useUpdateCreatorMutation,
    useAddCreatorStrikeMutation,
    useSuspendCreatorMutation,
    useReactivateCreatorMutation,
    // Superadmin content hooks
    useGetContentQuery,
    useGetContentStatsQuery,
    useGetContentByIdQuery,
    useUpdateContentMutation,
    useReviewContentMutation,
    useRemoveContentMutation,
    // Superadmin financial reports hooks
    useGetFinancialOverviewQuery,
    useGetRevenueReportQuery,
    useGetPayoutReportQuery,
    useGetRevenueAnalyticsQuery,
    useGetPayoutStatsQuery,
    useGetCreatorEarningsQuery,
    // Superadmin settings hooks
    useGetAllSettingsQuery,
    useGetPublicSettingsQuery,
    useGetSettingQuery,
    useBulkUpdateSettingsMutation,
    useInitializeSettingsMutation,
    useResetSettingsToDefaultsMutation,
    // Admin dashboard hooks
    useGetDashboardStatsQuery,
    useGetRevenueOverTimeQuery,
    useGetRecentActivityQuery,
    // Admin creators hooks
    useGetAdminCreatorsQuery,
    useGetAdminCreatorStatsQuery,
    useGetAdminCreatorByIdQuery,
    // Admin content hooks
    useGetAdminContentQuery,
    useGetAdminContentStatsQuery,
    useGetAdminContentByIdQuery,
    useReviewContentMutation,
    useFlagContentMutation,
    useRemoveContentMutation,
} = api;

export default api;