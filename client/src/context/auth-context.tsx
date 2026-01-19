// context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api-client';
import type { User } from '@/types/auth';

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  country: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor?: boolean; tempToken?: string }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  verify2FA: (tempToken: string, token: string) => Promise<void>;
  verifyBackupCode: (tempToken: string, backupCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getProfile();
      const userData = response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, clear auth state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // Verify ALL required auth data exists
      if (storedUser && accessToken && refreshToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Fetch fresh user data to ensure it's current
        try {
          await refreshUser();
        } catch (refreshError) {
          // If refresh fails, the user might be logged out on server
          console.error('Failed to refresh user on init:', refreshError);
          // Clear everything and force re-login
          localStorage.clear();
          sessionStorage.clear();
          setUser(null);
        }
      } else {
        // Incomplete auth data - clear everything
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear ALL stored data on error
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listen for token refresh events from axios interceptor
  useEffect(() => {
    const handleTokenRefresh = async () => {
      // Tokens are already updated in localStorage by the interceptor
      // Just refresh the user data to sync Context state
      try {
        await refreshUser();
      } catch (error) {
        console.error('Failed to refresh user after token refresh:', error);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-refreshed', handleTokenRefresh);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth-token-refreshed', handleTokenRefresh);
      }
    };
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const data = response.data.data;

      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        return {
          requiresTwoFactor: true,
          tempToken: data.tempToken,
        };
      }

      // Store tokens and user data
      const { user: userData, tokens } = data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return {};
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const verify2FA = async (tempToken: string, token: string) => {
    try {
      const response = await authApi.verify2FA(tempToken, token);
      const { user: userData, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    }
  };

  const verifyBackupCode = async (tempToken: string, backupCode: string) => {
    try {
      const response = await authApi.verifyBackupCode(tempToken, backupCode);
      const { user: userData, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Backup code verification error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,
      });
      const { user: userData, tokens } = response.data.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear state IMMEDIATELY to prevent race conditions
    setUser(null);
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Clear ALL localStorage items to prevent data retention
      localStorage.clear();
      sessionStorage.clear();
      
      // Make logout API call
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure cleanup happens even if API fails
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    verify2FA,
    verifyBackupCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
