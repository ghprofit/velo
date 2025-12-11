# Next.js Integration Guide - VeloLink Authentication

Complete guide for integrating VeloLink's authentication system with a Next.js frontend application.

## Table of Contents
- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [API Client Configuration](#api-client-configuration)
- [Authentication Context](#authentication-context)
- [Middleware & Route Protection](#middleware--route-protection)
- [Login & Registration](#login--registration)
- [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
- [Session Management](#session-management)
- [TypeScript Types](#typescript-types)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Overview

This guide covers integration with both **Next.js App Router** (recommended) and **Pages Router**. The authentication system includes:

- JWT-based authentication (access + refresh tokens)
- Email verification
- Password reset/recovery
- Two-Factor Authentication (TOTP)
- Session management
- Rate limiting
- Account lockout protection

---

## Environment Setup

### 1. Create Environment Variables

Create a `.env.local` file in your Next.js project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=false
```

### 2. Install Dependencies

```bash
npm install axios
# or
yarn add axios
# or
pnpm add axios
```

---

## API Client Configuration

Create an Axios client with automatic token refresh and error handling.

**Location**: `lib/api-client.ts`

See [examples/api-client.ts](./examples/api-client.ts) for the full implementation.

**Key Features**:
- Automatic access token injection
- Automatic token refresh on 401 errors
- Request/response interceptors
- TypeScript support
- Error handling

---

## Authentication Context

Create a React context to manage authentication state across your app.

**Location**: `context/auth-context.tsx`

See [examples/auth-context.tsx](./examples/auth-context.tsx) for the full implementation.

**Features**:
- User state management
- Login/logout functions
- Token refresh handling
- 2FA state management
- Loading states
- Persistence with localStorage or cookies

### Usage Example

```tsx
// app/layout.tsx (App Router)
import { AuthProvider } from '@/context/auth-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// Any component
import { useAuth } from '@/context/auth-context';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Middleware & Route Protection

### App Router Middleware

**Location**: `middleware.ts` (root directory)

See [examples/middleware.ts](./examples/middleware.ts) for the full implementation.

**Features**:
- Protect routes based on authentication status
- Redirect unauthenticated users to login
- Redirect authenticated users away from auth pages
- Role-based access control

### Protected Page Example

```tsx
// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return <div>Protected Dashboard</div>;
}
```

### Client-Side Protection

```tsx
// components/protected-route.tsx
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## Login & Registration

### Login Page

**Location**: `app/login/page.tsx`

See [examples/login-page.tsx](./examples/login-page.tsx) for the full implementation.

**Features**:
- Email/password login
- 2FA handling
- Error handling
- Loading states
- Redirect after login

### Registration Page

```tsx
// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(formData.email, formData.password);
      router.push('/verify-email');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Two-Factor Authentication (2FA)

### 2FA Setup Component

**Location**: `app/settings/2fa/page.tsx`

See [examples/2fa-setup.tsx](./examples/2fa-setup.tsx) for the full implementation.

**Features**:
- Generate QR code
- Verify initial setup
- Display backup codes
- Enable/disable 2FA
- Regenerate backup codes

### 2FA Verification During Login

```tsx
// components/2fa-verification.tsx
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface TwoFactorVerificationProps {
  tempToken: string;
  onSuccess: (tokens: any) => void;
}

export function TwoFactorVerification({ tempToken, onSuccess }: TwoFactorVerificationProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/2fa/verify', {
        tempToken,
        token: code,
      });

      onSuccess(response.data.data.tokens);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <h2>Two-Factor Authentication</h2>
      <p>Enter the 6-digit code from your authenticator app</p>

      {error && <div className="error">{error}</div>}

      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="000000"
        maxLength={6}
        pattern="[0-9]{6}"
        required
      />

      <button type="submit" disabled={loading || code.length !== 6}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>

      <a href="/login/backup-code">Use backup code instead</a>
    </form>
  );
}
```

---

## Session Management

### List Active Sessions

```tsx
// app/settings/sessions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface Session {
  id: string;
  deviceName: string;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await apiClient.get('/auth/sessions');
      setSessions(response.data.data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;

    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!confirm('This will log you out from all other devices. Continue?')) return;

    try {
      await apiClient.delete('/auth/sessions', {
        data: { currentSessionId: 'current' }, // Pass current session ID if you have it
      });
      loadSessions();
    } catch (error) {
      console.error('Failed to revoke sessions:', error);
    }
  };

  if (loading) return <div>Loading sessions...</div>;

  return (
    <div>
      <h1>Active Sessions</h1>
      <button onClick={revokeAllOtherSessions}>
        Logout from all other devices
      </button>

      <div className="sessions-list">
        {sessions.map((session) => (
          <div key={session.id} className="session-card">
            <h3>{session.deviceName}</h3>
            <p>IP: {session.ipAddress}</p>
            <p>Last used: {new Date(session.lastUsedAt).toLocaleString()}</p>
            <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
            <button onClick={() => revokeSession(session.id)}>
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## TypeScript Types

**Location**: `types/auth.ts`

See [examples/types/auth.ts](./examples/types/auth.ts) for the full type definitions.

---

## Error Handling

### Global Error Handler

```tsx
// lib/error-handler.ts
export function handleApiError(error: any): string {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data.message || 'Invalid request';
    case 401:
      return 'Session expired. Please login again.';
    case 403:
      return data.message || 'Access denied';
    case 404:
      return 'Resource not found';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return data.message || 'An error occurred';
  }
}
```

### Usage in Components

```tsx
import { handleApiError } from '@/lib/error-handler';

try {
  await apiClient.post('/auth/login', credentials);
} catch (error) {
  const errorMessage = handleApiError(error);
  setError(errorMessage);
}
```

---

## Best Practices

### 1. Token Storage

**Recommended: httpOnly Cookies (Production)**
- More secure than localStorage
- Automatic inclusion in requests
- Protected from XSS attacks

**Alternative: localStorage (Development)**
- Easier to implement
- More vulnerable to XSS
- Requires manual token management

### 2. Security Considerations

```tsx
// NEVER expose tokens in logs
console.log('User logged in'); // Good
console.log('Token:', accessToken); // BAD!

// Clear sensitive data on logout
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');

// Validate on both client and server
// Client-side for UX, server-side for security
```

### 3. Handle Token Expiry Gracefully

```tsx
// Refresh token before it expires
useEffect(() => {
  const refreshInterval = setInterval(async () => {
    await refreshAccessToken();
  }, 14 * 60 * 1000); // Refresh every 14 minutes (token expires in 15)

  return () => clearInterval(refreshInterval);
}, []);
```

### 4. Loading States

```tsx
// Show loading states for better UX
if (loading) {
  return <LoadingSpinner />;
}

// Handle errors gracefully
if (error) {
  return <ErrorMessage message={error} />;
}
```

### 5. Protect API Routes

```tsx
// app/api/protected/route.ts
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);
    // Handle request
  } catch (error) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

### 6. CSRF Protection

```tsx
// Add CSRF token to forms
<input type="hidden" name="csrf" value={csrfToken} />
```

### 7. Rate Limiting on Client

```tsx
// Debounce login attempts
import { debounce } from 'lodash';

const debouncedLogin = debounce(async (credentials) => {
  await login(credentials);
}, 1000);
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns tokens or 2FA challenge)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile

### Email Verification
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email

### Password Management
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)

### Two-Factor Authentication
- `POST /api/auth/2fa/setup` - Generate 2FA secret and QR code
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA during login
- `POST /api/auth/2fa/disable` - Disable 2FA
- `GET /api/auth/2fa/status` - Check 2FA status
- `POST /api/auth/2fa/backup-codes/regenerate` - Regenerate backup codes
- `POST /api/auth/2fa/verify-backup` - Login with backup code

### Session Management
- `GET /api/auth/sessions` - List active sessions
- `DELETE /api/auth/sessions/:id` - Revoke specific session
- `DELETE /api/auth/sessions` - Revoke all sessions

---

## Common Issues & Solutions

### Issue: "Invalid token" after refresh
**Solution**: Ensure refresh token is being sent correctly and hasn't expired

### Issue: CORS errors
**Solution**: Configure CORS in backend to allow your frontend origin

### Issue: 2FA QR code not displaying
**Solution**: Ensure the QR code data URL is being rendered correctly in an `<img>` tag

### Issue: Session persists after logout
**Solution**: Clear all tokens and user data from storage on logout

### Issue: Redirect loop on protected routes
**Solution**: Check middleware logic and ensure proper authentication state

---

## Example Project Structure

```
my-nextjs-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── settings/
│   │   ├── 2fa/
│   │   │   └── page.tsx
│   │   └── sessions/
│   │       └── page.tsx
│   └── layout.tsx
├── components/
│   ├── protected-route.tsx
│   └── 2fa-verification.tsx
├── context/
│   └── auth-context.tsx
├── lib/
│   ├── api-client.ts
│   └── error-handler.ts
├── types/
│   └── auth.ts
├── middleware.ts
└── .env.local
```

---

## Next Steps

1. Set up environment variables
2. Create API client with axios
3. Implement authentication context
4. Add middleware for route protection
5. Build login/register pages
6. Implement 2FA setup
7. Add session management
8. Test all flows thoroughly

For questions or issues, refer to the backend API documentation or open an issue on GitHub.
