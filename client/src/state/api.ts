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
    tagTypes: ["Auth", "User"],
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
} = api;

export default api;