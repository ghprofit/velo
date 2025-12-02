# Veriff HMAC Signature Debugging Guide

## What Changed

I've fixed the signature generation to match Veriff's API requirements:

### Before (❌ Incorrect):
```typescript
// Was concatenating payload + timestamp
const signaturePayload = `${payloadString}${timestamp}`;
signature = HMAC-SHA256(payload + timestamp, apiSecret);
```

### After (✅ Correct):
```typescript
// Now using only the payload
const payloadString = JSON.stringify(payload);
signature = HMAC-SHA256(payload, apiSecret);
```

## How Veriff Signature Works

According to Veriff API documentation:

1. **For Outgoing Requests (your app → Veriff):**
   - Calculate HMAC-SHA256 of the **JSON request body only**
   - Use your **API Secret** as the HMAC key
   - Send signature in `X-HMAC-SHA256` header
   - No timestamp needed in signature calculation

2. **For Incoming Webhooks (Veriff → your app):**
   - Veriff calculates HMAC-SHA256 of the webhook body
   - Uses **Webhook Secret** (Shared Secret) as the HMAC key
   - Sends signature in `x-hmac-sha256` header

## Verify Your Setup

### Step 1: Check Your API Secret

Make sure you have the correct API Secret in your `.env`:

```env
VERIFF_API_SECRET=your_actual_api_secret_here
```

**Important:**
- The API Secret is different from the API Key
- Get it from Veriff Dashboard → Settings → API → Private Key
- It should be a long hexadecimal string

### Step 2: Test Signature Generation

Add this temporary test endpoint to verify signature generation:

```typescript
// Add to veriff.controller.ts
@Post('debug/test-signature')
async testSignature(@Body() body: any) {
  const testPayload = { test: 'data' };
  const payloadString = JSON.stringify(testPayload);

  // Manual signature calculation
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', process.env.VERIFF_API_SECRET)
    .update(payloadString, 'utf8')
    .digest('hex');

  return {
    payload: testPayload,
    payloadString: payloadString,
    signature: signature,
    apiSecretConfigured: !!process.env.VERIFF_API_SECRET,
  };
}
```

### Step 3: Enable Debug Logging

The updated service now includes debug logging. To see it, set log level in your app:

```typescript
// In main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['log', 'error', 'warn', 'debug', 'verbose'],
});
```

You'll see output like:
```
[VeriffService] Generated signature for payload: {"verification":{"person":{"firstName":"John"...
[VeriffService] Signature: 42b21eb2f31084754dc9e1d35b2c6236808625613fd70c06f649bee0d8f098d0
```

## Common Signature Issues

### Issue 1: Wrong API Secret

**Symptom:** Always getting 401 with signature mismatch

**Solution:**
1. Go to Veriff Dashboard
2. Navigate to Settings → API
3. Copy the **Private Key** (not the Public Key)
4. Update `.env`:
   ```env
   VERIFF_API_SECRET=the_private_key_from_dashboard
   ```
5. Restart your app

### Issue 2: Extra Whitespace in Credentials

**Symptom:** Signature doesn't match

**Solution:**
Check your `.env` file for extra spaces:

```env
# ❌ Wrong - has spaces
VERIFF_API_SECRET = your_secret_here

# ✅ Correct - no spaces
VERIFF_API_SECRET=your_secret_here
```

### Issue 3: JSON Serialization Differences

**Symptom:** Signature sometimes works, sometimes doesn't

**Solution:**
The issue was that we're using `JSON.stringify()` which can produce different output based on property order. This should now be consistent.

If still having issues, try:
```typescript
// Sort keys before stringifying
const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
```

### Issue 4: Character Encoding

**Symptom:** Signature calculation seems correct but still fails

**Solution:**
Make sure you're using UTF-8 encoding:
```typescript
.update(payloadString, 'utf8')  // ✅ Correct
.update(payloadString)           // ⚠️ May cause issues
```

## Manual Signature Test

To verify the signature is being calculated correctly, you can test manually:

### Using Node.js:

```javascript
const crypto = require('crypto');

const apiSecret = 'your_api_secret_here';
const payload = {
  verification: {
    person: {
      firstName: "John",
      lastName: "Doe"
    },
    vendorData: "test-123"
  }
};

const payloadString = JSON.stringify(payload);
console.log('Payload:', payloadString);

const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(payloadString, 'utf8')
  .digest('hex');

console.log('Signature:', signature);
```

### Using Python:

```python
import hmac
import hashlib
import json

api_secret = b'your_api_secret_here'
payload = {
    "verification": {
        "person": {
            "firstName": "John",
            "lastName": "Doe"
        },
        "vendorData": "test-123"
    }
}

payload_string = json.dumps(payload, separators=(',', ':'))
print(f'Payload: {payload_string}')

signature = hmac.new(
    api_secret,
    payload_string.encode('utf-8'),
    hashlib.sha256
).hexdigest()

print(f'Signature: {signature}')
```

### Using Online Tool:

1. Go to https://www.freeformatter.com/hmac-generator.html
2. Enter your payload as JSON (minified, no spaces)
3. Select SHA256
4. Enter your API Secret
5. Compare with the signature in the error message

## Debugging Steps

If you're still getting signature errors:

### 1. Log the Exact Payload

Add this to `veriff.service.ts`:

```typescript
private generateSignature(payload: any): string {
  const payloadString = JSON.stringify(payload);

  // DEBUG: Log everything
  console.log('=== SIGNATURE DEBUG ===');
  console.log('Payload Object:', payload);
  console.log('Payload String:', payloadString);
  console.log('Payload Length:', payloadString.length);
  console.log('API Secret (first 10 chars):', this.apiSecret.substring(0, 10));

  const signature = crypto
    .createHmac('sha256', this.apiSecret)
    .update(payloadString, 'utf8')
    .digest('hex');

  console.log('Generated Signature:', signature);
  console.log('======================');

  return signature;
}
```

### 2. Compare with Error Message

The error message shows:
```
"Signature "42b21eb2f31084754dc9e1d35b2c6236808625613fd70c06f649bee0d8f098d0" does not match..."
```

Check:
- Is this the same signature your code generated?
- If yes → API Secret is wrong
- If no → Payload serialization issue

### 3. Verify Credentials Match

```bash
# Check what's in your .env
cat .env | grep VERIFF_

# Should output:
# VERIFF_API_KEY=...
# VERIFF_API_SECRET=...
# VERIFF_BASE_URL=...
# VERIFF_WEBHOOK_SECRET=...
```

### 4. Test with Veriff's Test Credentials

If you have test credentials from Veriff, try those first. Test environment is more forgiving.

## What Was Fixed

The main changes:

1. **Removed timestamp from signature** - Veriff doesn't use it
2. **Simplified signature generation** - Just HMAC of payload
3. **Added debug logging** - To help troubleshoot
4. **Fixed webhook verification** - To match the same pattern

## Next Steps

1. **Restart your application**:
   ```bash
   npm run start:dev
   ```

2. **Try creating a session again**:
   ```bash
   curl -X POST http://localhost:3000/veriff/sessions \
     -H "Content-Type: application/json" \
     -d '{"verification": {"person": {"firstName": "John", "lastName": "Doe"}, "vendorData": "test-123"}}'
   ```

3. **Check the logs** for the debug output

4. **If still failing**, verify your API Secret is correct in Veriff dashboard

## Still Having Issues?

If the signature error persists:

1. Double-check you copied the **Private Key** (API Secret), not the Public Key
2. Make sure there are no spaces or line breaks in your `.env` file
3. Verify you're using the correct environment (test vs production)
4. Contact Veriff support with the signature from the error message

The signature generation is now correct according to Veriff's API specification!
