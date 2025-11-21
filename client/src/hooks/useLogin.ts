import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginUserMutation } from '@/state/api';
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
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setError(null);

    try {
      const response = await loginUser({
        email: credentials.email.toLowerCase(),
        password: credentials.password,
      }).unwrap();

      // Store credentials in Redux
      dispatch(
        setCredentials({
          user: response.data.user,
          tokens: response.data.tokens,
        })
      );

      // Redirect based on user role
      const redirectPath = getRoleRedirectPath(response.data.user.role);
      router.push(redirectPath);
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string }; status?: number };
      const errorMessage =
        apiError.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  return {
    login,
    isLoading,
    error,
    clearError,
  };
};
