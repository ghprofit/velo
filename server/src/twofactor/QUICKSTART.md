# 2FA Quick Start Guide

## Setup (1 minute)

The 2FA module is already installed and configured!

## Test the 2FA Flow

### Step 1: Start Your Server

```bash
npm run start:dev
```

### Step 2: Setup 2FA

```bash
curl -X POST http://localhost:3000/2fa/setup \
  -H "Content-Type: application/json" \
  -d '{"userId": "testuser"}'
```

You'll receive:
- QR code (base64 image)
- Manual entry key
- Secret (save this for next step)

### Step 3: Scan QR Code

1. Open Google Authenticator or any TOTP app
2. Add new account
3. Paste the base64 QR code into a browser: `data:image/png;base64,YOUR_QR_CODE`
4. Scan the displayed QR code

OR

5. Manually enter the `manualEntryKey`

### Step 4: Get Test Token

```bash
curl http://localhost:3000/2fa/test/generate-token/testuser
```

This returns the current valid token.

### Step 5: Enable 2FA

```bash
curl -X POST http://localhost:3000/2fa/enable \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser",
    "secret": "YOUR_SECRET_FROM_STEP2",
    "token": "YOUR_TOKEN_FROM_STEP4"
  }'
```

You'll receive 8 backup codes - save them!

### Step 6: Verify Token

```bash
# Get current token
curl http://localhost:3000/2fa/test/generate-token/testuser

# Verify it
curl -X POST http://localhost:3000/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser",
    "token": "CURRENT_TOKEN"
  }'
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/2fa/setup` | POST | Generate QR code |
| `/2fa/enable` | POST | Enable 2FA |
| `/2fa/verify` | POST | Verify token |
| `/2fa/disable` | POST | Disable 2FA |
| `/2fa/status/:userId` | GET | Check status |
| `/2fa/verify-backup` | POST | Use backup code |
| `/2fa/regenerate-backup-codes` | POST | New backup codes |
| `/2fa/test/generate-token/:userId` | GET | Test token |
| `/2fa/health` | GET | Health check |

## Next Steps

1. **Integrate with your auth system** - See [examples/usage.example.ts](examples/usage.example.ts)
2. **Add database storage** - Replace in-memory Map with database
3. **Add rate limiting** - Prevent brute force attacks
4. **Remove test endpoints** - Before production deployment

See [README.md](README.md) for complete documentation.
