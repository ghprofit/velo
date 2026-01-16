'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearAuth } from '@/state/authSlice';
import { api } from '@/state/api';
import { apiClient } from '@/lib/api-client';

/**
 * Centralized logout hook with comprehensive cleanup
 * Use this hook in all components that need logout functionality
 *
 * Features:
 * - Calls logout API to invalidate server-side sessions
 * - Clears all browser storage (localStorage, sessionStorage)
 * - Clears HTTP-only cookies
 * - Resets Redux auth state
 * - Clears RTK Query cache
 * - Redirects to login page
 * - Handles errors gracefully (always cleans up and redirects even if API fails)
 *
 * @example
 * ```tsx
 * import { useLogout } from '@/hooks/useLogout';
 *
 * function MySidebar() {
 *   const { logout, isLoggingOut } = useLogout();
 *
 *   return (
 *     <button onClick={logout} disabled={isLoggingOut}>
 *       {isLoggingOut ? 'Logging out...' : 'Logout'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useLogout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      // Step 1: Call logout API (server clears cookies & DB)
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          await apiClient.post('/auth/logout', { refreshToken });
        }
      } catch (apiError) {
        // Continue cleanup even if API fails
        // This ensures user is logged out locally even if network fails
        console.error('Logout API error:', apiError);
      }

      // Step 2: Clear all browser storage
      localStorage.clear();
      sessionStorage.clear();

      // Step 3: Clear HTTP-only cookies (client-side clearing for non-httpOnly)
      // Note: httpOnly cookies can only be cleared by the server
      // This clears any non-httpOnly cookies that might exist
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // Step 4: Clear Redux auth state
      dispatch(clearAuth());

      // Step 5: Clear RTK Query cache
      // This ensures no stale data remains in the Redux store
      dispatch(api.util.resetApiState());

      // Step 6: Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout cleanup error:', error);
      // Always redirect even if cleanup fails
      // This ensures user is sent to login page regardless of errors
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  }, [dispatch, router]);

  return { logout, isLoggingOut };
}
