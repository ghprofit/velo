# Velo Setup Guide

Complete setup instructions for the Velo content monetization platform with anonymous buyer checkout flow.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis server
- AWS S3 bucket (for content storage)
- Stripe account (for payments)
- (Optional) Veriff account (for creator identity verification)

## Environment Variables

### Server (.env in `/server` directory)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/velo"

# JWT Secrets (generate secure random strings)
JWT_SECRET="your-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Verification
EMAIL_VERIFICATION_TOKEN_EXPIRY="86400"  # 24 hours in seconds
PASSWORD_RESET_TOKEN_EXPIRY="3600"       # 1 hour in seconds

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""  # Leave empty if no password
REDIS_DB="0"

# Rate Limiting
THROTTLE_TTL="60000"   # 1 minute in milliseconds
THROTTLE_LIMIT="100"   # 100 requests per minute

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET_NAME="velo-content"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email Service (configure based on your email provider)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT="587"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASSWORD="your-email-password"
EMAIL_FROM="Velo <noreply@yourdomain.com>"

# Veriff (Optional - for creator KYC verification)
VERIFF_API_KEY="your-veriff-api-key"
VERIFF_API_SECRET="your-veriff-api-secret"
VERIFF_BASE_URL="https://stationapi.veriff.com"

# Application
PORT="8000"
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000"
```

### Client (.env.local in `/client` directory)

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

## Installation Steps

### 1. Install Dependencies

#### Server
```bash
cd server
npm install
```

#### Client
```bash
cd client
npm install
```

### 2. Database Setup

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npm run seed
```

### 3. Start Redis

Make sure Redis is running:
```bash
# macOS/Linux with Homebrew
redis-server

# Windows - use Redis for Windows or WSL
```

### 4. Configure Stripe Webhooks

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI: `stripe login`
3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:8000/api/stripe/webhook
```
4. Copy the webhook signing secret from the output and add it to your server `.env` as `STRIPE_WEBHOOK_SECRET`

### 5. Start Development Servers

#### Server
```bash
cd server
npm run dev
```

#### Client
```bash
cd client
npm run dev
```

## Testing the Buyer Checkout Flow

1. **Create Creator Account**
   - Navigate to `/register`
   - Create a creator account
   - Login at `/login`

2. **Upload Content**
   - Go to `/creator/upload`
   - Upload a test video/image
   - Set a price (e.g., $9.99)
   - Wait for content approval (auto-approved in dev mode)

3. **Test Anonymous Purchase**
   - Open incognito/private browser window
   - Navigate to `/c/[content-id]` (get ID from creator dashboard)
   - Click "Purchase Now"
   - Enter email address
   - Complete payment with Stripe test card:
     - Card: `4242 4242 4242 4242`
     - Expiry: Any future date
     - CVC: Any 3 digits
     - ZIP: Any 5 digits

4. **View Purchased Content**
   - After successful payment, you'll be redirected to `/c/[content-id]`
   - Content will now show as "PURCHASED" with full access
   - Access token is saved in localStorage for future visits

## Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0027 6000 3184`
- **Declined**: `4000 0000 0000 0002`

## Common Issues

### Database Connection
If you get database connection errors:
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Recreate database if needed
dropdb velo
createdb velo
cd server && npx prisma migrate dev
```

### Redis Connection
If Redis connection fails:
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### Stripe Webhook Issues
- Make sure Stripe CLI is running with webhook forwarding
- Check webhook signing secret matches in `.env`
- Verify endpoint is accessible at `/api/stripe/webhook`

### Content Upload Issues
- Verify AWS credentials are correct
- Check S3 bucket exists and has correct permissions
- Ensure bucket allows CORS for your frontend URL

## Production Deployment

### Server
1. Set all environment variables in your hosting platform
2. Run database migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Start: `npm run start:prod`

### Client
1. Set `NEXT_PUBLIC_API_URL` to your production API URL
2. Build: `npm run build`
3. Deploy to Vercel/Netlify or run: `npm start`

### Stripe Webhook in Production
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api-domain.com/api/stripe/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook signing secret to production environment variables

## Security Checklist

- [ ] Change all default secrets and keys
- [ ] Use strong, unique JWT secrets
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Stripe webhook signature verification
- [ ] Use secure S3 bucket policies
- [ ] Enable Redis authentication in production
- [ ] Set up proper database backups
- [ ] Use environment-specific Stripe keys (test vs live)

## Support

For issues or questions:
- Check server logs: `cd server && npm run dev`
- Check client logs in browser console
- Review Stripe dashboard for payment issues
- Check database with: `cd server && npx prisma studio`
