import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
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

export interface Tokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthState {
    user: User | null;
    tokens: Tokens | null;
    isAuthenticated: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    error: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; tokens: Tokens }>
        ) => {
            state.user = action.payload.user;
            state.tokens = action.payload.tokens;
            state.isAuthenticated = true;
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setTokens: (state, action: PayloadAction<Tokens>) => {
            state.tokens = action.payload;
        },
        clearAuth: (state) => {
            state.user = null;
            state.tokens = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { setCredentials, setUser, setTokens, clearAuth, setError, clearError } =
    authSlice.actions;

export default authSlice.reducer;
