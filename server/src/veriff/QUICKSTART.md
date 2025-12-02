# Veriff KYC - Quick Start Guide

## Overview

Your Veriff KYC integration is now fully functional! This guide will help you get started quickly.

## Project Structure

```
src/veriff/
├── constants/
│   └── veriff.constants.ts          # API endpoints, status codes, constants
├── dto/
│   ├── create-session.dto.ts        # Request DTOs
│   ├── session-response.dto.ts      # Response DTOs
│   ├── webhook-event.dto.ts         # Webhook DTOs
│   └── index.ts                     # DTO exports
├── interfaces/
│   └── veriff-config.interface.ts   # Configuration interfaces
├── examples/
│   ├── usage.example.ts             # Code examples
│   └── api-requests.http            # HTTP request examples
├── veriff.controller.ts             # REST API endpoints
├── veriff.service.ts                # Core business logic
├── veriff.module.ts                 # Module configuration
├── README.md                        # Full documentation
└── QUICKSTART.md                    # This file
```

## Setup (5 minutes)

### Step 1: Get Veriff Credentials

1. Sign up at [Veriff](https://www.veriff.com/)
2. Get your API credentials from the dashboard:
   - API Key
   - API Secret
   - Webhook Secret

### Step 2: Configure Environment

Create a `.env` file in your project root:

```env
VERIFF_API_KEY=your_api_key_here
VERIFF_API_SECRET=your_api_secret_here
VERIFF_BASE_URL=https://stationapi.veriff.com/v1
VERIFF_WEBHOOK_SECRET=your_webhook_secret_here
```

**Note:** Use test credentials for development. Get them from Veriff's dashboard.

### Step 3: Start the Application

```bash
npm run start:dev
```

Your Veriff endpoints are now available at:
- `http://localhost:3000/veriff/*`

## Quick Test

### 1. Health Check

```bash
curl http://localhost:3000/veriff/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Create Verification Session

```bash
curl -X POST http://localhost:3000/veriff/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "verification": {
      "callback": "http://localhost:3000/veriff/webhooks/decision",
      "person": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "vendorData": "user-123"
    }
  }'
```

Expected response:
```json
{
  "status": "success",
  "verification": {
    "id": "abc123-session-id",
    "url": "https://magic.veriff.me/v/xxxxx",
    "vendorData": "user-123",
    "status": "created"
  }
}
```

### 3. Share Verification URL

Give the `verification.url` to your user. They will:
1. Click the link
2. Complete the verification on Veriff's platform
3. Upload their ID document
4. Take a selfie
5. Submit for verification

### 4. Receive Webhook

When verification completes, Veriff will POST to:
```
POST http://localhost:3000/veriff/webhooks/decision
```

Your application will automatically:
- Verify the webhook signature
- Log the decision
- Process the result

## Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/veriff/health` | Health check |
| POST | `/veriff/sessions` | Create verification session |
| GET | `/veriff/sessions/:id/decision` | Get verification status |
| GET | `/veriff/sessions/:id/media` | Get session media |
| PATCH | `/veriff/sessions/:id` | Resubmit session |
| DELETE | `/veriff/sessions/:id` | Cancel session |
| POST | `/veriff/webhooks/decision` | Webhook handler |

## Integration in Your Code

### Example: User Service Integration

```typescript
import { Injectable } from '@nestjs/common';
import { VeriffService } from './veriff/veriff.service';

@Injectable()
export class UserService {
  constructor(private veriffService: VeriffService) {}

  async startKYCForUser(userId: string, userData: any) {
    // Create verification session
    const session = await this.veriffService.createSession({
      verification: {
        callback: 'https://your-domain.com/veriff/webhooks/decision',
        person: {
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
        vendorData: userId,
      },
    });

    // Store session ID in your database
    // await this.db.users.update(userId, {
    //   veriffSessionId: session.verification.id
    // });

    // Return URL to frontend
    return {
      verificationUrl: session.verification.url,
    };
  }
}
```

## Webhook Processing

The webhook handler in [veriff.controller.ts](veriff.controller.ts) automatically processes decisions. Add your business logic:

```typescript
// In veriff.controller.ts - handleWebhook method

if (webhookData.verification.status === 'approved') {
  // Add your logic here:
  // - Update user in database
  // - Send notification
  // - Enable features
  const userId = webhookData.verification.vendorData;
  // await this.userService.approveUser(userId);
}
```

## Verification Status Codes

- **9001** - ✓ Approved
- **9102** - ↻ Resubmission requested
- **9103** - ✗ Declined
- **9104** - ⏱ Expired
- **9105** - 🚫 Abandoned

## Testing Tips

### Use Veriff Test Environment

For development, use test credentials and test URL:
```env
VERIFF_BASE_URL=https://stationapi.veriff.com/v1
```

### Test Webhook Locally

Use ngrok to expose your local server:
```bash
ngrok http 3000
```

Then configure the webhook URL in Veriff dashboard:
```
https://your-ngrok-url.ngrok.io/veriff/webhooks/decision
```

### Mock Webhook

You can test webhook handling with curl:
```bash
curl -X POST http://localhost:3000/veriff/webhooks/decision \
  -H "Content-Type: application/json" \
  -H "x-hmac-signature: test-signature" \
  -H "x-signature-timestamp: 2024-01-01T00:00:00.000Z" \
  -d '{
    "status": "success",
    "verification": {
      "id": "test-123",
      "code": 9001,
      "status": "approved",
      "vendorData": "user-123"
    }
  }'
```

## Next Steps

1. **Read the full documentation**: [README.md](README.md)
2. **Check code examples**: [examples/usage.example.ts](examples/usage.example.ts)
3. **Try API requests**: Open [examples/api-requests.http](examples/api-requests.http) in VS Code
4. **Configure production**: Update `.env` with production credentials
5. **Add business logic**: Integrate webhook handler with your database
6. **Test thoroughly**: Use test environment before going live

## Common Issues

### Issue: "Unable to reach Veriff API"
**Solution:** Check your API credentials and internet connection.

### Issue: "Invalid webhook signature"
**Solution:** Verify `VERIFF_WEBHOOK_SECRET` matches your Veriff dashboard.

### Issue: TypeScript errors
**Solution:** Run `npm install` to ensure all dependencies are installed.

### Issue: Build fails
**Solution:** Run `npm run build` to see detailed error messages.

## Support Resources

- **Full Documentation**: See [README.md](README.md)
- **Veriff API Docs**: https://developers.veriff.com/
- **NestJS Docs**: https://docs.nestjs.com/
- **Example Code**: Check `examples/` folder

## Production Checklist

Before going live:

- [ ] Replace test credentials with production credentials
- [ ] Update `VERIFF_BASE_URL` to production URL
- [ ] Configure proper webhook URL (HTTPS required)
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Add logging and analytics
- [ ] Test webhook signature verification
- [ ] Set up database to store session IDs
- [ ] Implement retry logic for failed requests
- [ ] Add rate limiting
- [ ] Set up alerts for verification failures
- [ ] Test the complete user flow
- [ ] Review security best practices

## Quick Reference

### Create Session
```typescript
await veriffService.createSession(dto);
```

### Check Status
```typescript
await veriffService.getVerificationStatus(sessionId);
```

### Is Approved?
```typescript
veriffService.isVerificationApproved(status);
```

### Verify Webhook
```typescript
veriffService.verifyWebhookSignature(body, signature, timestamp);
```

---

**You're all set!** Your Veriff KYC integration is ready to use. Start with the quick test above, then integrate it into your application.
