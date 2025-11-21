import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterUserMutation } from '@/state/api';
import { useAppDispatch } from '@/app/redux';
import { setCredentials, setError as setAuthError } from '@/state/authSlice';

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
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
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [error, setError] = useState<string | null>(null);

  const register = async (data: RegisterData): Promise<void> => {
    setError(null);

    try {
      const response = await registerUser({
        email: data.email.toLowerCase(),
        password: data.password,
        displayName: data.displayName.trim(),
        firstName: data.firstName?.trim() || undefined,
        lastName: data.lastName?.trim() || undefined,
      }).unwrap();

      // Store credentials in Redux
      dispatch(
        setCredentials({
          user: response.data.user,
          tokens: response.data.tokens,
        })
      );

      // Navigate to verification step
      router.push('/register/verify');
    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string }; status?: number };
      const errorMessage =
        apiError.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      dispatch(setAuthError(errorMessage));
      throw new Error(errorMessage);
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
