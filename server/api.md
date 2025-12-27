# VeloLink API Documentation

## Overview

VeloLink is a content platform with authentication, verification, and anonymous buyer tracking. This API is built with Express.js, Prisma ORM, and PostgreSQL.

## Base URL
```
Development: http://localhost:8000
Production: https://api.velolink.com
```

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

### Headers
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. Register Creator Account

Create a new creator account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "creator@example.com",
  "password": "SecurePass123",
  "displayName": "John Creator",
  "firstName": "John",
  "lastName": "Doe",
  "country": "US"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "creator@example.com",
      "role": "CREATOR",
      "emailVerified": false,
      "creatorProfile": {
        "id": "clyyy...",
        "displayName": "John Creator",
        "verificationStatus": "PENDING"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

### 2. Login

Login with email and password.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "creator@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "creator@example.com",
      "role": "CREATOR",
      "emailVerified": false,
      "creatorProfile": {
        "id": "clyyy...",
        "displayName": "John Creator",
        "profileImage": null,
        "verificationStatus": "PENDING"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

---

### 3. Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 900
    }
  }
}
```

---

### 4. Logout

Invalidate refresh token.

**Endpoint:** `POST /api/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

### 5. Get Profile

Get current user profile (requires authentication).

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "creator@example.com",
      "role": "CREATOR",
      "emailVerified": false,
      "isActive": true,
      "lastLogin": "2025-01-10T12:00:00.000Z",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "creatorProfile": {
        "id": "clyyy...",
        "displayName": "John Creator",
        "bio": null,
        "profileImage": null,
        "coverImage": null,
        "verificationStatus": "PENDING",
        "verifiedAt": null,
        "firstName": "John",
        "lastName": "Doe",
        "country": "US",
        "totalEarnings": 0,
        "totalViews": 0,
        "totalPurchases": 0
      }
    }
  }
}
```

---

## Verification Endpoints

### 1. Initiate Verification

Start Veriff identity verification process (requires authentication).

**Endpoint:** `POST /api/verification/initiate`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Verification session created",
  "data": {
    "sessionId": "abc123...",
    "verificationUrl": "https://magic.veriff.me/v/abc123..."
  }
}
```

---

### 2. Get Verification Status

Get current verification status (requires authentication).

**Endpoint:** `GET /api/verification/status`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "VERIFIED",
    "verifiedAt": "2025-01-05T14:30:00.000Z",
    "message": "Identity verification successful",
    "notes": "Decision code: 9001, Status: approved"
  }
}
```

**Verification Statuses:**
- `PENDING` - Waiting for verification to be started
- `IN_PROGRESS` - Verification is being processed
- `VERIFIED` - Identity verified successfully
- `REJECTED` - Verification failed
- `EXPIRED` - Verification session expired

---

### 3. Veriff Webhook

Webhook endpoint for Veriff verification decisions (public endpoint).

**Endpoint:** `POST /api/verification/webhook`

**Headers:**
```
X-HMAC-Signature: <signature>
```

**Request Body:**
```json
{
  "id": "session-id",
  "feature": "selfid",
  "code": 9001,
  "action": "verification",
  "vendorData": "user-id"
}
```

---

### 4. Manual Verification (Admin Only)

Manually verify or reject a creator (requires admin authentication).

**Endpoint:** `POST /api/verification/manual`

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "creatorId": "clyyy...",
  "status": "VERIFIED",
  "notes": "Verified documents manually"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Creator verified successfully."
}
```

---

## Buyer (Anonymous Purchase Tracking) Endpoints

### 1. Get or Create Buyer Session

Create or retrieve anonymous buyer session for tracking purchases.

**Endpoint:** `POST /api/buyer/session`

**Request Body:**
```json
{
  "fingerprint": "browser-fingerprint-hash"
}
```

**Headers (Optional):**
```
X-Buyer-Session: <existing_session_token>
```

**Response:** `201 Created` or `200 OK`
```json
{
  "success": true,
  "message": "Buyer session created",
  "data": {
    "sessionToken": "uuid-v4-token",
    "expiresAt": "2025-04-10T12:00:00.000Z"
  }
}
```

**Note:** Store the `sessionToken` in localStorage or cookies to track buyer's purchases across sessions.

---

### 2. Get Buyer Purchases

Get all purchases for the current buyer session.

**Endpoint:** `GET /api/buyer/purchases`

**Headers:**
```
X-Buyer-Session: <session_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "purchases": [
      {
        "id": "clxxx...",
        "accessToken": "content_uuid...",
        "purchasedAt": "2025-01-10T10:00:00.000Z",
        "viewCount": 5,
        "lastViewedAt": "2025-01-10T15:30:00.000Z",
        "content": {
          "id": "clyyy...",
          "title": "Premium Video Content",
          "description": "Amazing content description",
          "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
          "contentType": "VIDEO",
          "price": 9.99,
          "creator": {
            "displayName": "John Creator",
            "profileImage": "https://cdn.example.com/profile.jpg"
          }
        }
      }
    ]
  }
}
```

---

### 3. Verify Content Access

Verify access to purchased content and get content details.

**Endpoint:** `GET /api/buyer/access/:accessToken`

**Headers:**
```
X-Buyer-Session: <session_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "content": {
      "id": "clyyy...",
      "title": "Premium Video Content",
      "description": "Amazing content description",
      "contentType": "VIDEO",
      "s3Key": "content/video-file.mp4",
      "s3Bucket": "velolink-content",
      "duration": 300,
      "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
      "contentItems": []
    },
    "purchase": {
      "purchasedAt": "2025-01-10T10:00:00.000Z",
      "viewCount": 6,
      "lastViewedAt": "2025-01-10T16:00:00.000Z"
    }
  }
}
```

---

### 4. Cleanup Expired Sessions (Admin/Cron)

Delete expired buyer sessions (should be called by scheduled task).

**Endpoint:** `DELETE /api/buyer/cleanup-sessions`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cleaned up 42 expired sessions.",
  "data": {
    "deletedCount": 42
  }
}
```

---

## User Roles

- `CREATOR` - Content creators who can upload and sell content
- `ADMIN` - Platform administrators
- `SUPPORT` - Support team members
- `SUPER_ADMIN` - Super administrators with full access

---

## Error Responses

All endpoints follow this error response format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

---

## Authentication Flow

### For Creators:

1. **Register** - `POST /api/auth/register`
2. **Login** - `POST /api/auth/login` (get access & refresh tokens)
3. **Initiate Verification** - `POST /api/verification/initiate` (get Veriff URL)
4. **Complete Verification** - User completes verification on Veriff
5. **Webhook** - Veriff sends webhook to `/api/verification/webhook`
6. **Check Status** - `GET /api/verification/status`

### For Anonymous Buyers:

1. **Get Session** - `POST /api/buyer/session` (store session token)
2. **Browse Content** - Public content endpoints (to be implemented)
3. **Purchase Content** - Payment endpoints (to be implemented)
4. **Access Content** - `GET /api/buyer/access/:accessToken`
5. **View Purchases** - `GET /api/buyer/purchases`

---

## Token Management

### Access Token
- **Expires:** 15 minutes
- **Usage:** All authenticated API requests
- **Header:** `Authorization: Bearer <access_token>`

### Refresh Token
- **Expires:** 7 days
- **Usage:** Get new access token when expired
- **Endpoint:** `POST /api/auth/refresh`
- **Storage:** Store securely (httpOnly cookie or secure storage)

### Buyer Session Token
- **Expires:** 90 days
- **Usage:** Track anonymous buyer purchases
- **Header:** `X-Buyer-Session: <session_token>`
- **Storage:** localStorage or cookie

---

## Next Steps (To Be Implemented)

- Content upload endpoints
- Payment integration (Stripe/PayPal)
- AWS Rekognition content compliance
- Public content browsing
- Creator earnings/payouts
- Admin moderation endpoints
- Email notifications
- WebSocket for real-time notifications

---

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

**Key Models:**
- `User` - User accounts (creators, admins, support)
- `CreatorProfile` - Creator-specific data
- `Content` - Content items (videos, images)
- `Purchase` - Purchase records
- `BuyerSession` - Anonymous buyer tracking
- `RefreshToken` - JWT refresh tokens
- `Notification` - User notifications
- `AdminAction` - Audit log for admin actions

---

## Environment Variables

See `.env.example` for all required environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token signing secret

**Optional (for features):**
- `VERIFF_API_KEY` - Veriff API key
- `AWS_REGION` - AWS region (required for SES)
- `AWS_ACCESS_KEY_ID` - AWS access key (required for SES and S3)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (required for SES and S3)
- `SES_FROM_EMAIL` - Sender email address for notifications
- `SES_FROM_NAME` - Sender name for email notifications
- `STRIPE_*` - Stripe payment integration
- `PAYPAL_*` - PayPal payment integration

---

## Development

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## Testing with cURL

### Register a Creator:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "displayName": "Test Creator"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Get Profile:
```bash
curl -X GET http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Support

For questions or issues, contact: support@velolink.com
