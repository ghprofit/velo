// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, verify2FA } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.requiresTwoFactor) {
        // 2FA is required
        setTwoFactorRequired(true);
        setTempToken(result.tempToken || '');
      } else {
        // Login successful, redirect
        router.push(redirectUrl);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verify2FA(tempToken, twoFactorCode);
      router.push(redirectUrl);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Invalid 2FA code. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If 2FA is required, show 2FA form
  if (twoFactorRequired) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Two-Factor Authentication</h1>
          <p>Enter the 6-digit code from your authenticator app</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handle2FAVerification}>
            <div className="form-group">
              <label htmlFor="twoFactorCode">Authentication Code</label>
              <input
                id="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                autoComplete="off"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || twoFactorCode.length !== 6}
              className="btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <div className="alternative-options">
              <Link href="/login/backup-code">
                Use backup code instead
              </Link>
              <button
                type="button"
                onClick={() => {
                  setTwoFactorRequired(false);
                  setTwoFactorCode('');
                  setTempToken('');
                }}
                className="btn-text"
              >
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Regular login form
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p>Sign in to your VeloLink account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="signup-prompt">
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-card {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1a202c;
        }

        p {
          color: #718096;
          margin-bottom: 24px;
        }

        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2d3748;
          font-size: 14px;
        }

        input[type='email'],
        input[type='password'],
        input[type='text'] {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #4a5568;
          cursor: pointer;
        }

        .link {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
        }

        .link:hover {
          text-decoration: underline;
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #5568d3;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-text {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-size: 14px;
          padding: 0;
          text-decoration: underline;
        }

        .divider {
          text-align: center;
          margin: 24px 0;
          color: #a0aec0;
          position: relative;
        }

        .divider::before,
        .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 45%;
          height: 1px;
          background: #e2e8f0;
        }

        .divider::before {
          left: 0;
        }

        .divider::after {
          right: 0;
        }

        .signup-prompt {
          text-align: center;
        }

        .alternative-options {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
