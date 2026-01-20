import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAppDispatch } from '@/app/redux';
import { setCredentials, setError as setAuthError } from '@/state/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  requiresTwoFactor: boolean;
  tempToken: string | null;
  verify2FA: (code: string) => Promise<void>;
}

// Role-based redirect mapping
const getRoleRedirectPath = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/superadmin/dashboard';
    case 'ADMIN':
    case 'SUPPORT':
      return '/admin/dashboard';
    default:
      return '/creator';
  }
};

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { login: authLogin, verify2FA: authVerify2FA } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await authLogin(
        credentials.email.toLowerCase(),
        credentials.password
      );

      if (result.requiresTwoFactor) {
        // 2FA is required
        setRequiresTwoFactor(true);
        setTempToken(result.tempToken || null);
        setIsLoading(false);
        return;
      }

      // Login successful - get user data from localStorage (just set by authLogin)
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (storedUser && accessToken && refreshToken) {
        const userData = JSON.parse(storedUser);
        
        // Store in Redux for compatibility
        dispatch(
          setCredentials({
            user: userData,
            tokens: {
              accessToken,
              refreshToken,
              expiresIn: 900,
            },
          })
        );

        // Redirect based on user role
        const redirectPath = getRoleRedirectPath(userData.role);
        router.push(redirectPath);
      } else {
        throw new Error('Login failed: User data not found');
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (code: string): Promise<void> => {
    if (!tempToken) {
      setError('Invalid session. Please login again.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authVerify2FA(tempToken, code);

      // 2FA verification successful - get user data from localStorage (just set by authVerify2FA)
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (storedUser && accessToken && refreshToken) {
        const userData = JSON.parse(storedUser);
        
        dispatch(
          setCredentials({
            user: userData,
            tokens: {
              accessToken,
              refreshToken,
              expiresIn: 900,
            },
          })
        );

        // Redirect based on user role
        const redirectPath = getRoleRedirectPath(userData.role);
        router.push(redirectPath);
      } else {
        throw new Error('2FA verification failed: User data not found');
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Invalid 2FA code. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    isLoading,
    error,
    clearError,
    requiresTwoFactor,
    tempToken,
    verify2FA,
  };
};
