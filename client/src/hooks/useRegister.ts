import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api-client';
import { useAppDispatch } from '@/app/redux';
import { setCredentials, setError as setAuthError } from '@/state/authSlice';

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  country: string;
}

interface UseRegisterReturn {
  register: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useRegister = (): UseRegisterReturn => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterData): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.register({
        email: data.email.toLowerCase(),
        password: data.password,
        displayName: data.displayName.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        country: data.country,
      });

      const { user, tokens } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Store credentials in Redux
      dispatch(
        setCredentials({
          user,
          tokens,
        })
      );

      // Navigate to email verification step
      router.push('/register/verify');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      console.error('Error response:', error.response);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.';

      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    register,
    isLoading,
    error,
    clearError,
  };
};
