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

interface CreatorDetail extends Creator {
    profile: {
        displayName?: string;
        bio?: string;
        profileImage?: string;
        coverImage?: string;
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
        country?: string;
    };
    verification: {
        status?: string;
        verifiedAt?: string;
        notes?: string;
    };
    payout: {
        status?: string;
        paypalEmail?: string;
        stripeAccountId?: string;
    };
    stats: {
        totalEarnings: number;
        totalViews: number;
        totalPurchases: number;
        contentCount: number;
    };
    recentContent: Array<{
        id: string;
        title: string;
        status: string;
        createdAt: string;
    }>;
    recentPayouts: Array<{
        id: string;
        amount: number;
        status: string;
        createdAt: string;
    }>;
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

interface RecentPurchaseItem {
    id: string;
    buyerEmail?: string;
    amount: number;
    createdAt: string;
}

// Content Management Types
interface ContentItem {
    id: string;
    s3Key: string;
    s3Bucket: string;
    fileSize?: number;
    order: number;
    signedUrl: string;
}

interface Content {
    id: string;
    title: string;
    description?: string;
    creatorName: string;
    creatorId: string;
    contentType: string;
    mediaType: string;
    thumbnailUrl: string;
    s3Key?: string;
    s3Bucket?: string;
    price: number;
    status: string;
    complianceStatus: string;
    complianceNotes?: string;
    isPublished: boolean;
    viewCount: number;
    purchaseCount: number;
    totalRevenue: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    recentPurchases?: RecentPurchaseItem[];
    contentItems?: ContentItem[];
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

interface SuperAdminReviewContentRequest {
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

interface RecentContentItem {
    id: string;
    title: string;
    status: string;
    createdAt: string;
}

interface RecentPayoutItem {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
}

interface AdminCreatorDetailsResponse {
    success: boolean;
    data: AdminCreator & {
        bio?: string;
        profileImage?: string;
        coverImage?: string;
        payoutStatus: string;
        policyStrikes: number;
        recentContent: RecentContentItem[];
        recentPayouts: RecentPayoutItem[];
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
        signedUrl?: string;
        contentItems?: {
            id: string;
            s3Key: string;
            s3Bucket: string;
            fileSize: number;
            order: number;
            signedUrl?: string;
        }[];
        recentPurchases: RecentPurchaseItem[];
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

// Admin Payout Types
interface AdminPaymentStats {
    totalRevenue: number;
    totalPayouts: number;
    pendingPayouts: number;
    rejectedPayouts: number;
    failedTransactions: number;
}

interface AdminPayout {
    id: string;
    creatorName: string;
    creatorEmail: string;
    amount: number;
    currency: string;
    paymentMethod: string | null;
    status: string;
    createdAt: string;
    processedAt: string | null;
}

interface AdminPayoutsResponse {
    data: AdminPayout[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface AdminTransaction {
    id: string;
    contentId: string;
    buyerEmail: string;
    creatorName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    completedAt?: string | null;
}

interface AdminTransactionsResponse {
    data: AdminTransaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface QueryTransactionsParams {
    search?: string;
    status?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

interface QueryPayoutsParams {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
}

interface CreatorPerformanceData {
    creatorId: string;
    creatorName: string;
    totalViews: number;
    totalRevenue: number;
    contentCount: number;
    engagement: number;
    category: string;
}

interface CreatorPerformanceResponse {
    success: boolean;
    data: CreatorPerformanceData[];
}

interface AnalyticsOverviewData {
    totalRevenue: number;
    revenueGrowth: number;
    activeCreators: number;
    creatorsGrowth: number;
    contentUploaded: number;
    contentGrowth: number;
    avgTransactionValue: number;
}

interface AnalyticsOverviewResponse {
    success: boolean;
    data: AnalyticsOverviewData;
}

interface RevenueTrendData {
    period: string;
    revenue: number;
}

interface RevenueTrendsResponse {
    success: boolean;
    data: RevenueTrendData[];
}

interface UserGrowthData {
    period: string;
    count: number;
}

interface UserGrowthResponse {
    success: boolean;
    data: UserGrowthData[];
}

interface ContentPerformanceData {
    contentType: string;
    count: number;
    percentage: number;
}

interface ContentPerformanceResponse {
    success: boolean;
    data: ContentPerformanceData[];
}

interface GeographicDistributionData {
    country: string;
    percentage: number;
    count: number;
}

interface GeographicDistributionResponse {
    success: boolean;
    data: GeographicDistributionData[];
}

// Support Types
interface SupportStatsData {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    urgentTickets: number;
    averageResponseTime: number;
}

interface SupportStatsResponse {
    success: boolean;
    data: SupportStatsData;
}

interface SupportTicketData {
    id: string;
    userId: string;
    email: string;
    subject: string;
    message: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    user?: {
        id: string;
        email: string;
    };
}

interface SupportTicketsResponse {
    success: boolean;
    data: SupportTicketData[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface SupportTicketResponse {
    success: boolean;
    data: SupportTicketData;
}

interface QuerySupportTicketsParams {
    search?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
}

// Notification Types
export interface NotificationStatsData {
    total: number;
    unread: number;
    byType: Record<string, number>;
    recent: number;
}

interface NotificationStatsResponse {
    success: boolean;
    data: NotificationStatsData;
}

// User Notification Stats Types
export interface UserNotificationStatsData {
    unreadCount: number;
    recentUnread: number;
    reportsAwaiting: number;
    paymentAlerts: number;
    systemUpdates: number;
}

interface UserNotificationStatsResponse {
    success: boolean;
    data: UserNotificationStatsData;
}

interface UserNotificationsResponse {
    success: boolean;
    data: NotificationData[];
}

export interface NotificationData {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

interface NotificationsResponse {
    success: boolean;
    data: NotificationData[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface SingleNotificationResponse {
    success: boolean;
    data: NotificationData;
}

interface QueryNotificationsParams {
    search?: string;
    type?: string;
    isRead?: boolean;
    userId?: string;
    page?: number;
    limit?: number;
}

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
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
    tagTypes: ["Auth", "User", "Admin", "Creator", "Content", "Settings", "Dashboard", "Support", "Notification"],
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
                url: '/api/auth/verify-email',
                method: 'POST',
                body: { token },
            }),
        }),
        resendVerificationEmail: build.mutation<ResendVerificationResponse, { email: string }>({
            query: (body) => ({
                url: '/api/auth/resend-verification',
                method: 'POST',
                body,
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
        getCreatorById: build.query<{ success: boolean; data: CreatorDetail }, string>({
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
        getSuperAdminContentById: build.query<ContentResponse, string>({
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
        superAdminReviewContent: build.mutation<ContentResponse, { id: string; data: SuperAdminReviewContentRequest }>({
            query: ({ id, data }) => ({
                url: `/api/superadmin/content/${id}/review`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Content'],
        }),
        superAdminRemoveContent: build.mutation<ContentResponse, { id: string; data: RemoveContentRequest }>({
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
        adminRemoveContent: build.mutation<{ success: boolean; message: string }, { id: string; reason: string }>({
            query: ({ id, reason }) => ({
                url: `/api/admin/content/${id}/remove`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: ['Content'],
        }),

        // Admin Payout endpoints
        getPaymentStats: build.query<AdminPaymentStats, void>({
            query: () => '/api/admin/payments/stats',
            providesTags: ['Dashboard'],
        }),
        getPayouts: build.query<AdminPayoutsResponse, QueryPayoutsParams>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.search) searchParams.append('search', params.search);
                if (params.status) searchParams.append('status', params.status);
                if (params.page) searchParams.append('page', params.page.toString());
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/api/admin/payouts?${searchParams.toString()}`;
            },
            providesTags: ['Dashboard'],
        }),
        getAdminTransactions: build.query<AdminTransactionsResponse, QueryTransactionsParams>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.search) searchParams.append('search', params.search);
                if (params.status) searchParams.append('status', params.status);
                if (params.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
                if (params.startDate) searchParams.append('startDate', params.startDate);
                if (params.endDate) searchParams.append('endDate', params.endDate);
                if (params.page) searchParams.append('page', params.page.toString());
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/api/admin/payments/transactions?${searchParams.toString()}`;
            },
            providesTags: ['Dashboard'],
        }),
        processPayout: build.mutation<{ success: boolean; message: string }, { payoutId: string }>({
            query: ({ payoutId }) => ({
                url: `/api/admin/payouts/${payoutId}/process`,
                method: 'POST',
            }),
            invalidatesTags: ['Dashboard'],
        }),
        // Admin reports endpoints
        getCreatorPerformance: build.query<CreatorPerformanceResponse, { limit?: number; sortBy?: 'revenue' | 'views' | 'engagement' }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.limit) searchParams.append('limit', params.limit.toString());
                if (params.sortBy) searchParams.append('sortBy', params.sortBy);
                return `/api/admin/reports/creator-performance?${searchParams.toString()}`;
            },
            providesTags: ['Dashboard'],
        }),
        getAnalyticsOverview: build.query<AnalyticsOverviewResponse, void>({
            query: () => '/api/admin/reports/analytics-overview',
            providesTags: ['Dashboard'],
        }),
        getRevenueTrends: build.query<RevenueTrendsResponse, { period?: 'WEEKLY' | 'MONTHLY' | 'YEARLY' }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.period) searchParams.append('period', params.period);
                return `/api/admin/reports/revenue-trends?${searchParams.toString()}`;
            },
            providesTags: ['Dashboard'],
        }),
        getUserGrowth: build.query<UserGrowthResponse, { userType?: 'CREATORS' | 'BUYERS' }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.userType) searchParams.append('userType', params.userType);
                return `/api/admin/reports/user-growth?${searchParams.toString()}`;
            },
            providesTags: ['Dashboard'],
        }),
        getContentPerformance: build.query<ContentPerformanceResponse, void>({
            query: () => '/api/admin/reports/content-performance',
            providesTags: ['Dashboard'],
        }),
        getGeographicDistribution: build.query<GeographicDistributionResponse, { limit?: number }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/api/admin/reports/geographic-distribution?${searchParams.toString()}`;
            },
            providesTags: ['Dashboard'],
        }),
        // Admin support endpoints
        getSupportStats: build.query<SupportStatsResponse, void>({
            query: () => '/api/admin/support/stats',
            providesTags: ['Support'],
        }),
        getSupportTickets: build.query<SupportTicketsResponse, QuerySupportTicketsParams>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.search) searchParams.append('search', params.search);
                if (params.status) searchParams.append('status', params.status);
                if (params.priority) searchParams.append('priority', params.priority);
                if (params.assignedTo) searchParams.append('assignedTo', params.assignedTo);
                if (params.page) searchParams.append('page', params.page.toString());
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/api/admin/support/tickets?${searchParams.toString()}`;
            },
            providesTags: ['Support'],
        }),
        getTicketById: build.query<SupportTicketResponse, string>({
            query: (id) => `/api/admin/support/tickets/${id}`,
            providesTags: ['Support'],
        }),
        updateTicketStatus: build.mutation<{ success: boolean }, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `/api/admin/support/tickets/${id}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: ['Support'],
        }),
        updateTicketPriority: build.mutation<{ success: boolean }, { id: string; priority: string }>({
            query: ({ id, priority }) => ({
                url: `/api/admin/support/tickets/${id}/priority`,
                method: 'PUT',
                body: { priority },
            }),
            invalidatesTags: ['Support'],
        }),
        assignTicket: build.mutation<{ success: boolean }, { id: string; assignedTo: string }>({
            query: ({ id, assignedTo }) => ({
                url: `/api/admin/support/tickets/${id}/assign`,
                method: 'PUT',
                body: { assignedTo },
            }),
            invalidatesTags: ['Support'],
        }),
        deleteTicket: build.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/api/admin/support/tickets/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Support'],
        }),
        // User notification endpoints
        getUserNotifications: build.query<UserNotificationsResponse, { category?: string }>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.category) searchParams.append('category', params.category);
                return `/api/notifications?${searchParams.toString()}`;
            },
            providesTags: ['Notification'],
        }),
        getUserNotificationStats: build.query<UserNotificationStatsResponse, void>({
            query: () => '/api/notifications/stats',
            providesTags: ['Notification'],
        }),
        markUserNotificationAsRead: build.mutation<SingleNotificationResponse, string>({
            query: (id) => ({
                url: `/api/notifications/${id}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllUserNotificationsAsRead: build.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/api/notifications/read-all',
                method: 'PATCH',
            }),
            invalidatesTags: ['Notification'],
        }),
        clearAllReadNotifications: build.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/api/notifications/read',
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
        deleteUserNotification: build.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/api/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
        // Admin notification endpoints
        getNotificationStats: build.query<NotificationStatsResponse, void>({
            query: () => '/api/admin/notifications/stats',
            providesTags: ['Notification'],
        }),
        getNotifications: build.query<NotificationsResponse, QueryNotificationsParams>({
            query: (params = {}) => {
                const searchParams = new URLSearchParams();
                if (params.search) searchParams.append('search', params.search);
                if (params.type) searchParams.append('type', params.type);
                if (params.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
                if (params.userId) searchParams.append('userId', params.userId);
                if (params.page) searchParams.append('page', params.page.toString());
                if (params.limit) searchParams.append('limit', params.limit.toString());
                return `/api/admin/notifications?${searchParams.toString()}`;
            },
            providesTags: ['Notification'],
        }),
        getNotificationById: build.query<SingleNotificationResponse, string>({
            query: (id) => `/api/admin/notifications/${id}`,
            providesTags: ['Notification'],
        }),
        createNotification: build.mutation<SingleNotificationResponse, {
            userId: string;
            type: string;
            title: string;
            message: string;
            metadata?: Record<string, unknown>;
        }>({
            query: (data) => ({
                url: '/api/admin/notifications',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Notification'],
        }),
        broadcastNotification: build.mutation<{ success: boolean; data: { count: number } }, {
            type: string;
            title: string;
            message: string;
            userRole?: string;
            metadata?: Record<string, unknown>;
        }>({
            query: (data) => ({
                url: '/api/admin/notifications/broadcast',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Notification'],
        }),
        markNotificationAsRead: build.mutation<SingleNotificationResponse, string>({
            query: (id) => ({
                url: `/api/admin/notifications/${id}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsAsRead: build.mutation<{ success: boolean; data: { count: number } }, { userId?: string }>({
            query: (data) => ({
                url: '/api/admin/notifications/read-all',
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Notification'],
        }),
        deleteNotification: build.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/api/admin/notifications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
        deleteAllNotifications: build.mutation<{ success: boolean; data: { count: number } }, { userId?: string }>({
            query: (data) => ({
                url: '/api/admin/notifications',
                method: 'DELETE',
                body: data,
            }),
            invalidatesTags: ['Notification'],
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
    useGetSuperAdminContentByIdQuery,
    useUpdateContentMutation,
    useSuperAdminReviewContentMutation,
    useSuperAdminRemoveContentMutation,
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
    useAdminRemoveContentMutation,
    // Admin payout hooks
    useGetPaymentStatsQuery,
    useGetPayoutsQuery,
    useProcessPayoutMutation,
    // Admin transaction hooks
    useGetAdminTransactionsQuery,
    // Admin reports hooks
    useGetCreatorPerformanceQuery,
    useGetAnalyticsOverviewQuery,
    useGetRevenueTrendsQuery,
    useGetUserGrowthQuery,
    useGetContentPerformanceQuery,
    useGetGeographicDistributionQuery,
    // Admin support hooks
    useGetSupportStatsQuery,
    useGetSupportTicketsQuery,
    useGetTicketByIdQuery,
    useUpdateTicketStatusMutation,
    useUpdateTicketPriorityMutation,
    useAssignTicketMutation,
    useDeleteTicketMutation,
    // User notification hooks
    useGetUserNotificationsQuery,
    useGetUserNotificationStatsQuery,
    useMarkUserNotificationAsReadMutation,
    useMarkAllUserNotificationsAsReadMutation,
    useClearAllReadNotificationsMutation,
    useDeleteUserNotificationMutation,
    // Admin notification hooks
    useGetNotificationStatsQuery,
    useGetNotificationsQuery,
    useGetNotificationByIdQuery,
    useCreateNotificationMutation,
    useBroadcastNotificationMutation,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useDeleteNotificationMutation,
    useDeleteAllNotificationsMutation,
} = api;

export default api;