# Quick Start Guide - VeloLink Authentication

Get your authentication system up and running in minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Redis server installed
- AWS account with SES configured (for emails)

---

## Step 1: Environment Setup

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` and fill in these REQUIRED values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/velolink"

# JWT Secrets (CRITICAL - Generate strong secrets!)
JWT_SECRET="your-very-secure-secret-at-least-32-characters-long-change-this"
JWT_REFRESH_SECRET="your-very-secure-refresh-secret-at-least-32-characters-long-change-this"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# AWS SES
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
SES_FROM_EMAIL="noreply@yourdomain.com"
SES_FROM_NAME="VeloLink"

# App URLs
CLIENT_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000"

# 2FA
TWO_FACTOR_APP_NAME="VeloLink"

# Server
PORT=8000
NODE_ENV="development"
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Start Redis

### Option A: Docker (Recommended)
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

### Option B: Local Installation
```bash
# Windows (WSL or install Redis for Windows)
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis
```

Verify Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

---

## Step 4: Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name complete-auth-system

# Or push schema directly
npx prisma db push
```

---

## Step 5: Start the Server

```bash
# Development mode
npm run dev

# Or production mode
npm run build
npm run start
```

You should see:
```
🚀 Server is running on http://localhost:8000
✅ Database connected
✅ Redis connected
```

---

## Step 6: Test the API

### Using cURL

**1. Register a user:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

**3. Get Profile (with token from login):**
```bash
curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman/Thunder Client

Import these endpoints:

**Base URL**: `http://localhost:8000/api`

**Available endpoints**:
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`
- POST `/auth/logout`
- GET `/auth/profile`
- POST `/auth/verify-email`
- POST `/auth/resend-verification`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- POST `/auth/change-password`
- POST `/auth/2fa/setup`
- POST `/auth/2fa/enable`
- POST `/auth/2fa/verify`
- POST `/auth/2fa/disable`
- GET `/auth/2fa/status`
- POST `/auth/2fa/backup-codes/regenerate`
- POST `/auth/2fa/verify-backup`
- GET `/auth/sessions`
- DELETE `/auth/sessions/:id`
- DELETE `/auth/sessions`

---

## Step 7: Enable 2FA (Optional)

**1. Setup 2FA:**
```bash
curl -X POST http://localhost:8000/api/auth/2fa/setup \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

This returns:
- QR code (data URL)
- Secret key
- Manual entry key

**2. Scan QR code** with Google Authenticator or Authy

**3. Enable 2FA with verification code:**
```bash
curl -X POST http://localhost:8000/api/auth/2fa/enable \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_SECRET_FROM_SETUP",
    "token": "123456"
  }'
```

This returns backup codes - **save them!**

**4. Login with 2FA:**

Step 1 - Regular login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

Returns: `{ requiresTwoFactor: true, tempToken: "..." }`

Step 2 - Verify 2FA:
```bash
curl -X POST http://localhost:8000/api/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "tempToken": "TEMP_TOKEN_FROM_LOGIN",
    "token": "123456"
  }'
```

Returns: Full auth tokens

---

## Step 8: Integrate with Next.js (Optional)

See the comprehensive guide: [`docs/nextjs-integration.md`](./nextjs-integration.md)

Quick steps:
1. Create Next.js app: `npx create-next-app@latest`
2. Copy example files from `docs/examples/`
3. Install axios: `npm install axios`
4. Set up environment variables
5. Implement authentication flow

---

## Common Issues & Solutions

### ❌ "JWT_SECRET is not defined"
**Fix**: Add `JWT_SECRET` to `.env` file (no default values!)

### ❌ "Can't reach database server"
**Fix**:
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Test connection: `psql -U user -d velolink`

### ❌ "Redis connection failed"
**Fix**:
- Start Redis: `docker start redis` or `brew services start redis`
- Check Redis is running: `redis-cli ping`
- Verify REDIS_HOST and REDIS_PORT in .env

### ❌ "Email not sending"
**Fix**:
- Verify AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are valid
- Ensure SES email addresses are verified in AWS Console
- Check if account is in SES sandbox mode (requires recipient verification)
- Review AWS SES sending quota in AWS Console
- See [AWS_SES_SETUP.md](../src/email/AWS_SES_SETUP.md) for detailed setup instructions

### ❌ "Account locked" message
**Fix**: This is working as intended after 5 failed login attempts. Wait 30 minutes or clear Redis: `redis-cli FLUSHDB`

### ❌ CORS errors from frontend
**Fix**: Add your frontend URL to ALLOWED_ORIGINS in .env

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Can register a new user
- [ ] Verification email received
- [ ] Can verify email
- [ ] Can login with credentials
- [ ] Receive access and refresh tokens
- [ ] Can access protected routes with token
- [ ] Token refresh works
- [ ] Can logout
- [ ] Password reset email received
- [ ] Can reset password
- [ ] Can setup 2FA
- [ ] Can login with 2FA
- [ ] Backup codes work
- [ ] Can view active sessions
- [ ] Can revoke sessions
- [ ] Account locks after 5 failed attempts

---

## What's Next?

### Production Deployment

1. **Set strong secrets**:
   ```bash
   # Generate secure secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use environment-specific configs**:
   - `.env.development`
   - `.env.production`

3. **Enable HTTPS** (required for cookies)

4. **Configure proper CORS** (restrict origins)

5. **Set up monitoring**:
   - Error tracking (Sentry)
   - Performance monitoring
   - Log aggregation

6. **Database backups** (automated)

7. **Redis persistence** (AOF or RDB)

### Recommended Tools

- **API Testing**: Postman, Insomnia, or Thunder Client
- **Database GUI**: TablePlus, pgAdmin, or DBeaver
- **Redis GUI**: RedisInsight or Medis
- **Monitoring**: Sentry, LogRocket, or DataDog

---

## Quick Reference

### Default Credentials (Development)
- No default users - create via `/auth/register`

### Default Ports
- Server: `8000`
- PostgreSQL: `5432`
- Redis: `6379`
- Next.js (if used): `3000`

### Token Expiry
- Access Token: 15 minutes
- Refresh Token: 7 days
- Verification Token: 24 hours
- Password Reset Token: 1 hour
- 2FA Temp Token: 5 minutes

### Rate Limits
- Global: 100 req/min
- Login: 5 attempts/15 min
- 2FA Verify: 5 attempts/5 min
- Password Reset: 3 attempts/hour
- Email Verification: 5/min
- Resend Verification: 3/hour

---

## Support

- 📚 Full documentation: `docs/nextjs-integration.md`
- 📝 Implementation summary: `docs/IMPLEMENTATION_SUMMARY.md`
- 🔧 Environment template: `.env.example`

---

## Success! 🎉

You now have a fully functional authentication system with:
- ✅ JWT authentication
- ✅ Email verification
- ✅ Password reset
- ✅ Two-factor authentication (TOTP)
- ✅ Session management
- ✅ Account lockout protection
- ✅ Rate limiting
- ✅ Redis caching

**Start building your application!** 🚀
