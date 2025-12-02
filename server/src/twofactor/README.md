# Two-Factor Authentication (2FA) Module

A complete TOTP (Time-Based One-Time Password) implementation for NestJS applications.

## Features

✅ **TOTP Generation** - Time-based one-time passwords (30-second windows)
✅ **QR Code Generation** - Easy setup with authenticator apps
✅ **Backup Codes** - 8 single-use backup codes for account recovery
✅ **Token Verification** - Secure 6-digit token validation
✅ **Account Management** - Enable/disable 2FA per user
✅ **Status Tracking** - Check 2FA status and remaining backup codes
✅ **In-Memory Storage** - Ready for database integration
✅ **Full TypeScript Support** - Complete type safety

## Compatible Authenticator Apps

- Google Authenticator (iOS/Android)
- Microsoft Authenticator
- Authy
- 1Password
- LastPass Authenticator
- Any TOTP-compatible app

## Quick Start

### 1. Setup 2FA for a User

```bash
curl -X POST http://localhost:3000/2fa/setup \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgo...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP",
  "userId": "user123"
}
```

- `qrCodeUrl`: Display this as an image for users to scan
- `manualEntryKey`: Users can manually enter this in their authenticator app
- `secret`: Store this temporarily (don't show to user)

### 2. User Scans QR Code

The user scans the QR code with their authenticator app (Google Authenticator, Authy, etc.)

### 3. Enable 2FA

Verify the first token to enable 2FA:

```bash
curl -X POST http://localhost:3000/2fa/enable \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "secret": "JBSWY3DPEHPK3PXP",
    "token": "123456"
  }'
```

**Response:**
```json
{
  "enabled": true,
  "message": "2FA enabled successfully. Save your backup codes in a secure location.",
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    "I9J0K1L2",
    "M3N4O5P6",
    "Q7R8S9T0",
    "U1V2W3X4",
    "Y5Z6A7B8",
    "C9D0E1F2"
  ]
}
```

**IMPORTANT:** Display backup codes to the user ONCE. They should save them securely.

### 4. Verify Token (Login)

When user logs in, verify their 2FA token:

```bash
curl -X POST http://localhost:3000/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "token": "654321"
  }'
```

**Response:**
```json
{
  "verified": true,
  "message": "Token verified successfully"
}
```

## API Endpoints

### POST `/2fa/setup`
Generate secret and QR code for a user.

**Request:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "secret": "SECRET_BASE32",
  "qrCodeUrl": "data:image/png;base64,...",
  "manualEntryKey": "SECRET_BASE32",
  "userId": "user123"
}
```

### POST `/2fa/enable`
Enable 2FA after verifying initial token.

**Request:**
```json
{
  "userId": "user123",
  "secret": "SECRET_BASE32",
  "token": "123456"
}
```

**Response:**
```json
{
  "enabled": true,
  "message": "2FA enabled successfully",
  "backupCodes": ["CODE1", "CODE2", ...]
}
```

### POST `/2fa/verify`
Verify a 2FA token during login.

**Request:**
```json
{
  "userId": "user123",
  "token": "123456"
}
```

**Response:**
```json
{
  "verified": true,
  "message": "Token verified successfully"
}
```

### POST `/2fa/disable`
Disable 2FA for a user.

**Request:**
```json
{
  "userId": "user123",
  "token": "123456"
}
```

**Response:**
```json
{
  "disabled": true,
  "message": "2FA disabled successfully"
}
```

### GET `/2fa/status/:userId`
Get 2FA status for a user.

**Response:**
```json
{
  "enabled": true,
  "hasSecret": true,
  "remainingBackupCodes": 7
}
```

### POST `/2fa/verify-backup`
Verify a backup code (single-use).

**Request:**
```json
{
  "userId": "user123",
  "backupCode": "A1B2C3D4"
}
```

**Response:**
```json
{
  "verified": true,
  "message": "Backup code verified successfully"
}
```

### POST `/2fa/regenerate-backup-codes`
Generate new backup codes.

**Request:**
```json
{
  "userId": "user123",
  "token": "123456"
}
```

**Response:**
```json
{
  "backupCodes": ["NEW1", "NEW2", ...],
  "message": "Backup codes regenerated successfully"
}
```

### GET `/2fa/test/generate-token/:userId`
Generate current valid token (for testing).

**Response:**
```json
{
  "userId": "user123",
  "token": "123456",
  "message": "This token is valid for 30 seconds",
  "expiresIn": "30 seconds"
}
```

### GET `/2fa/health`
Health check endpoint.

## Integration Example

### In Your Auth Service

```typescript
import { Injectable } from '@nestjs/common';
import { TwofactorService } from './twofactor/twofactor.service';

@Injectable()
export class AuthService {
  constructor(private twofactorService: TwofactorService) {}

  async login(userId: string, password: string, token?: string) {
    // 1. Verify username/password
    const user = await this.validateUser(userId, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check if 2FA is enabled
    if (this.twofactorService.is2FAEnabled(userId)) {
      if (!token) {
        return {
          requires2FA: true,
          message: 'Please provide 2FA token',
        };
      }

      // 3. Verify 2FA token
      const verified = this.twofactorService.verifyToken(userId, token);
      if (!verified) {
        throw new UnauthorizedException('Invalid 2FA token');
      }
    }

    // 4. Generate JWT and return
    return {
      accessToken: this.generateJWT(user),
      user,
    };
  }

  async enable2FAForUser(userId: string) {
    // Generate secret and QR code
    const { secret, qrCodeUrl, manualEntryKey } =
      this.twofactorService.generateSecret(userId);

    // Return to frontend to display QR code
    return {
      qrCodeUrl,
      manualEntryKey,
      secret, // Send to frontend, user will verify with token
    };
  }
}
```

### In Your Frontend

```typescript
// 1. Start 2FA setup
const setupResponse = await fetch('/2fa/setup', {
  method: 'POST',
  body: JSON.stringify({ userId: 'user123' }),
});

const { qrCodeUrl, secret } = await setupResponse.json();

// 2. Display QR code to user
document.getElementById('qr-code').src = qrCodeUrl;

// 3. User scans QR code and enters token
const userToken = '123456'; // From user input

// 4. Enable 2FA
const enableResponse = await fetch('/2fa/enable', {
  method: 'POST',
  body: JSON.stringify({
    userId: 'user123',
    secret: secret,
    token: userToken,
  }),
});

const { backupCodes } = await enableResponse.json();

// 5. Display backup codes (IMPORTANT - show once!)
alert('Save these backup codes: ' + backupCodes.join(', '));
```

## Security Best Practices

### 1. Store Secrets Securely
```typescript
// ❌ DON'T store in memory (current implementation)
private userSecrets: Map<string, User2FAData> = new Map();

// ✅ DO store in database (encrypted)
async enable2FA(userId: string, secret: string, token: string) {
  // Encrypt secret before storing
  const encryptedSecret = await this.encrypt(secret);

  await this.userRepository.update(userId, {
    twoFactorSecret: encryptedSecret,
    twoFactorEnabled: true,
  });
}
```

### 2. Hash Backup Codes
The service already hashes backup codes using SHA-256:
```typescript
private hashBackupCode(code: string): string {
  return crypto.createHash('sha256')
    .update(code.toLowerCase())
    .digest('hex');
}
```

### 3. Rate Limiting
Add rate limiting to prevent brute force attacks:
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 attempts per minute
@Post('verify')
async verify2FA(@Body() verifyDto: Verify2FADto) {
  // ...
}
```

### 4. Require Password for Disable
Always require both password AND 2FA token to disable 2FA:
```typescript
async disable2FA(userId: string, password: string, token: string) {
  // Verify password
  await this.verifyPassword(userId, password);

  // Verify 2FA token
  this.veriffService.verifyToken(userId, token);

  // Then disable
  this.twofactorService.disable2FA(userId, token);
}
```

### 5. Audit Logging
Log all 2FA events:
```typescript
// Log when 2FA is enabled
this.auditLog.create({
  userId,
  action: '2FA_ENABLED',
  ip: request.ip,
  timestamp: new Date(),
});

// Log failed verification attempts
this.auditLog.create({
  userId,
  action: '2FA_VERIFICATION_FAILED',
  ip: request.ip,
  timestamp: new Date(),
});
```

## Database Integration

### User Schema Example

```typescript
import { Entity, Column } from 'typeorm';

@Entity()
export class User {
  @Column()
  id: string;

  @Column({ nullable: true })
  twoFactorSecret: string; // Encrypted!

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column('simple-array', { nullable: true })
  backupCodes: string[]; // Hashed!

  @Column({ nullable: true })
  twoFactorEnabledAt: Date;
}
```

### Service with Database

```typescript
@Injectable()
export class TwofactorService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async enable2FA(userId: string, secret: string, token: string) {
    // Verify token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid token');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(8);

    // Encrypt secret
    const encryptedSecret = await this.encrypt(secret);

    // Save to database
    await this.userRepository.update(userId, {
      twoFactorSecret: encryptedSecret,
      twoFactorEnabled: true,
      backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
      twoFactorEnabledAt: new Date(),
    });

    return { enabled: true, backupCodes };
  }
}
```

## Testing

### Test Complete Flow

```bash
# 1. Setup 2FA
curl -X POST http://localhost:3000/2fa/setup -H "Content-Type: application/json" -d '{"userId":"test-user"}'

# 2. Generate test token
curl http://localhost:3000/2fa/test/generate-token/test-user

# 3. Enable 2FA with test token
curl -X POST http://localhost:3000/2fa/enable -H "Content-Type: application/json" -d '{"userId":"test-user","secret":"YOUR_SECRET","token":"GENERATED_TOKEN"}'

# 4. Verify token
curl -X POST http://localhost:3000/2fa/verify -H "Content-Type: application/json" -d '{"userId":"test-user","token":"CURRENT_TOKEN"}'

# 5. Check status
curl http://localhost:3000/2fa/status/test-user

# 6. Test backup code
curl -X POST http://localhost:3000/2fa/verify-backup -H "Content-Type: application/json" -d '{"userId":"test-user","backupCode":"YOUR_BACKUP_CODE"}'
```

## Troubleshooting

### Token Always Invalid

**Problem:** Generated tokens don't verify

**Solution:**
1. Check system time is synchronized (TOTP is time-based)
2. Verify the secret matches between setup and verification
3. Token is case-sensitive and must be 6 digits

### QR Code Won't Scan

**Problem:** Authenticator app can't scan QR code

**Solution:**
1. Use the `manualEntryKey` instead
2. Check QR code is displayed correctly
3. Ensure adequate lighting/screen brightness

### Lost Access (No Token or Backup Codes)

**Problem:** User lost their phone and backup codes

**Solution:**
1. Implement admin override function
2. Require identity verification
3. Disable 2FA for the user
4. Have user set up 2FA again

## Production Checklist

- [ ] Replace in-memory storage with database
- [ ] Encrypt secrets before storing
- [ ] Add rate limiting to prevent brute force
- [ ] Implement audit logging
- [ ] Add password requirement for sensitive operations
- [ ] Remove test endpoints (`/test/generate-token`, `/test/clear-all`)
- [ ] Add email notifications for 2FA changes
- [ ] Implement backup code regeneration with limits
- [ ] Add support for remembering devices (optional)
- [ ] Set up monitoring for failed verification attempts

## License

MIT
