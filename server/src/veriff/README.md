# Veriff KYC Integration Module

A fully functional NestJS module for integrating Veriff KYC (Know Your Customer) verification into your application.

## Features

- Create verification sessions
- Get verification status and decisions
- Retrieve session media (images, videos)
- Resubmit verification sessions
- Cancel verification sessions
- Webhook handling with signature verification
- Support for multiple configuration methods
- Comprehensive error handling and logging
- Full TypeScript support with DTOs

## Installation

The required dependencies are already installed:
- `axios` - HTTP client for API requests
- `@nestjs/config` - Configuration management

## Configuration

### Option 1: Environment Variables (Recommended)

1. Create a `.env` file in your project root:

```env
VERIFF_API_KEY=your_veriff_api_key_here
VERIFF_API_SECRET=your_veriff_api_secret_here
VERIFF_BASE_URL=https://stationapi.veriff.com/v1
VERIFF_WEBHOOK_SECRET=your_webhook_secret_here
```

2. Import the module in your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VeriffModule } from './veriff/veriff.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    VeriffModule.forRoot(), // Uses environment variables
  ],
})
export class AppModule {}
```

### Option 2: Direct Configuration

```typescript
import { VeriffModule } from './veriff/veriff.module';

@Module({
  imports: [
    VeriffModule.register({
      apiKey: 'your_api_key',
      apiSecret: 'your_api_secret',
      baseUrl: 'https://stationapi.veriff.com/v1',
      webhookSecret: 'your_webhook_secret',
    }),
  ],
})
export class AppModule {}
```

### Option 3: Async Configuration

```typescript
import { VeriffModule } from './veriff/veriff.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    VeriffModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get('VERIFF_API_KEY'),
        apiSecret: configService.get('VERIFF_API_SECRET'),
        baseUrl: configService.get('VERIFF_BASE_URL'),
        webhookSecret: configService.get('VERIFF_WEBHOOK_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## API Endpoints

### 1. Create Verification Session

**POST** `/veriff/sessions`

Creates a new verification session for a user.

**Request Body:**
```json
{
  "verification": {
    "callback": "https://your-domain.com/veriff/webhooks/decision",
    "person": {
      "firstName": "John",
      "lastName": "Doe",
      "idNumber": "12345678"
    },
    "vendorData": "user-123"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "verification": {
    "id": "verification-session-id",
    "url": "https://magic.veriff.me/v/xxxxx",
    "vendorData": "user-123",
    "status": "created"
  }
}
```

### 2. Get Verification Status

**GET** `/veriff/sessions/:sessionId/decision`

Retrieves the verification decision/status for a session.

**Response:**
```json
{
  "status": "success",
  "verification": {
    "id": "session-id",
    "code": 9001,
    "status": "approved",
    "person": {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01"
    },
    "document": {
      "number": "12345678",
      "type": "PASSPORT",
      "country": "US"
    }
  }
}
```

### 3. Get Session Media

**GET** `/veriff/sessions/:sessionId/media`

Retrieves media files (images, videos) associated with a verification session.

### 4. Resubmit Session

**PATCH** `/veriff/sessions/:sessionId`

Resubmits a verification session with updated information.

### 5. Cancel Session

**DELETE** `/veriff/sessions/:sessionId`

Cancels an active verification session.

### 6. Webhook Endpoint

**POST** `/veriff/webhooks/decision`

Receives webhook notifications from Veriff when verification decisions are made.

**Headers Required:**
- `x-hmac-signature`: HMAC signature for verification
- `x-signature-timestamp`: Timestamp of the signature

### 7. Health Check

**GET** `/veriff/health`

Simple health check endpoint.

## Usage Examples

### Creating a Verification Session

```typescript
import { Injectable } from '@nestjs/common';
import { VeriffService } from './veriff/veriff.service';

@Injectable()
export class UserService {
  constructor(private readonly veriffService: VeriffService) {}

  async initiateKYC(userId: string, userData: any) {
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

    // Store session.verification.id with your user record
    // Return session.verification.url to user for verification
    return {
      sessionId: session.verification.id,
      verificationUrl: session.verification.url,
    };
  }
}
```

### Checking Verification Status

```typescript
async checkVerificationStatus(sessionId: string) {
  const status = await this.veriffService.getVerificationStatus(sessionId);

  if (this.veriffService.isVerificationApproved(status)) {
    console.log('User is verified!');
    // Update user status in database
  } else if (this.veriffService.isVerificationDeclined(status)) {
    console.log('Verification declined:', status.verification.reason);
  } else if (this.veriffService.isResubmissionRequired(status)) {
    console.log('Resubmission required');
  }

  return status;
}
```

### Handling Webhooks

The webhook handler is already implemented in the controller. When Veriff sends a decision webhook, it will:

1. Verify the webhook signature
2. Log the verification status
3. Process the decision based on status

You can add your business logic in the `handleWebhook` method in `veriff.controller.ts`:

```typescript
// Inside handleWebhook method
if (webhookData.verification.status === 'approved') {
  // Update your database
  await this.userService.markUserAsVerified(webhookData.verification.vendorData);
  // Send notification to user
  await this.notificationService.sendVerificationApproved(userId);
}
```

## Verification Status Codes

- **9001**: Approved - Person verified successfully
- **9102**: Resubmission requested - Additional information needed
- **9103**: Declined - Verification failed
- **9104**: Expired - Session expired
- **9105**: Abandoned - User abandoned the verification

## Security

### HMAC Signature Verification

All API requests to Veriff are signed with HMAC-SHA256 using your API secret. The service automatically:

- Generates signatures for outgoing requests
- Verifies signatures on incoming webhooks

### Webhook Security

Always verify webhook signatures before processing:

```typescript
const isValid = this.veriffService.verifyWebhookSignature(
  rawBody,
  signature,
  timestamp
);

if (!isValid) {
  throw new BadRequestException('Invalid webhook signature');
}
```

## Error Handling

The module includes comprehensive error handling:

- API errors are logged and converted to HTTP exceptions
- Network errors are caught and reported
- Invalid signatures are rejected
- All errors include detailed logging

## Testing

To test the Veriff integration:

1. Get test credentials from Veriff dashboard
2. Use the test environment URL: `https://stationapi.veriff.com/v1`
3. Create a test session and use the verification URL
4. Monitor logs for webhook callbacks

## API Documentation

For complete Veriff API documentation, visit:
https://developers.veriff.com/

## Support

For issues or questions:
- Check Veriff API docs: https://developers.veriff.com/
- Review NestJS documentation: https://docs.nestjs.com/

## License

This module is part of your NestJS application.
