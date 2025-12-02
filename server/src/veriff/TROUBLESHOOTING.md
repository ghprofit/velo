# Veriff Integration - Troubleshooting Guide

## 404 Error: "Not Found"

If you're getting a 404 error when calling the Veriff API, here are the common causes and solutions:

### 1. Check Your Environment Variables

**Problem:** Missing or incorrect environment variables in `.env` file.

**Solution:**

1. Make sure you have a `.env` file in your project root (not in src/)
2. Copy from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Update with your actual credentials:
   ```env
   VERIFF_API_KEY=your_actual_api_key_here
   VERIFF_API_SECRET=your_actual_api_secret_here
   VERIFF_BASE_URL=https://stationapi.veriff.com
   VERIFF_WEBHOOK_SECRET=your_actual_webhook_secret
   ```

4. **Restart your application** after updating `.env`:
   ```bash
   npm run start:dev
   ```

### 2. Verify API Credentials

**Problem:** Invalid or test API credentials.

**Solution:**

1. Log in to your Veriff dashboard: https://station.veriff.com/
2. Navigate to **Settings** → **API**
3. Copy the correct credentials:
   - API Key (Public Key)
   - API Secret (Private Key)
   - Webhook Secret (Shared Secret)

### 3. Check Base URL

**Problem:** Incorrect base URL in environment variables.

**Solution:**

Make sure your `.env` has:
```env
VERIFF_BASE_URL=https://stationapi.veriff.com
```

**NOT:**
- ~~`https://stationapi.veriff.com/v1`~~ (wrong - includes /v1)
- ~~`https://api.veriff.com`~~ (wrong - old endpoint)

### 4. Test Environment vs Production

**Problem:** Using production credentials with test environment or vice versa.

**Solution:**

For **testing/development**:
```env
VERIFF_API_KEY=your_test_api_key
VERIFF_API_SECRET=your_test_api_secret
VERIFF_BASE_URL=https://stationapi.veriff.com
```

For **production**:
```env
VERIFF_API_KEY=your_production_api_key
VERIFF_API_SECRET=your_production_api_secret
VERIFF_BASE_URL=https://stationapi.veriff.com
```

### 5. Debug the Request

Add this temporary debug code to `veriff.service.ts` to see what's being sent:

```typescript
// In veriff.service.ts, add to setupInterceptors():
this.axiosInstance.interceptors.request.use(
  (config) => {
    // ADD THIS DEBUG CODE:
    console.log('🔍 Veriff Request Debug:');
    console.log('URL:', config.baseURL + config.url);
    console.log('Method:', config.method);
    console.log('Headers:', config.headers);
    console.log('Data:', JSON.stringify(config.data, null, 2));
    // END DEBUG CODE

    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(config.data, timestamp);
    // ... rest of code
  }
);
```

### 6. Verify Request Format

The correct request to create a session should be:

**URL:** `POST https://stationapi.veriff.com/v1/sessions`

**Headers:**
```
Content-Type: application/json
X-AUTH-CLIENT: your_api_key
X-HMAC-SIGNATURE: generated_signature
X-SIGNATURE-TIMESTAMP: 2024-01-01T12:00:00.000Z
```

**Body:**
```json
{
  "verification": {
    "callback": "https://your-domain.com/veriff/webhooks/decision",
    "person": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "vendorData": "user-123"
  }
}
```

### 7. Check Signature Generation

**Problem:** Incorrect HMAC signature causing API rejection.

**Solution:**

Verify your API Secret is correct. The signature is generated as:
```
HMAC-SHA256(payload + timestamp, apiSecret)
```

If the signature is wrong, Veriff might return 404 instead of 401.

### 8. Network/Firewall Issues

**Problem:** Corporate firewall or proxy blocking Veriff API.

**Solution:**

1. Test if you can reach Veriff:
   ```bash
   curl https://stationapi.veriff.com
   ```

2. Check if you need proxy settings in your code

3. Try from a different network

### 9. Common Mistakes Checklist

- [ ] `.env` file exists in project root (not in src/)
- [ ] API credentials are correct (copy-pasted from Veriff dashboard)
- [ ] No extra spaces in `.env` values
- [ ] Application restarted after updating `.env`
- [ ] Base URL is `https://stationapi.veriff.com` (no /v1)
- [ ] Using correct environment credentials (test vs production)

### 10. Test with cURL

Test the Veriff API directly with cURL to verify credentials:

```bash
# Replace with your actual credentials
API_KEY="your_api_key_here"
API_SECRET="your_api_secret_here"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

# Create the payload
PAYLOAD='{"verification":{"person":{"firstName":"John","lastName":"Doe"},"vendorData":"test-123"}}'

# Generate signature (you'll need a script for this)
# For now, test without signature to see if it's a signature issue

curl -X POST https://stationapi.veriff.com/v1/sessions \
  -H "Content-Type: application/json" \
  -H "X-AUTH-CLIENT: $API_KEY" \
  -d "$PAYLOAD"
```

If this returns 401 Unauthorized, your credentials are working but signature is wrong.
If this returns 404, your credentials or URL are incorrect.

### 11. Enable Detailed Logging

Update `veriff.service.ts` to log more details:

```typescript
private handleApiError(error: AxiosError): void {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // ADD MORE LOGGING:
    console.error('❌ Veriff API Error Details:');
    console.error('Status:', status);
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
    console.error('Response:', JSON.stringify(data, null, 2));

    this.logger.error(
      `Veriff API error: ${status}`,
      JSON.stringify(data),
    );
    // ... rest of code
  }
}
```

### 12. Contact Veriff Support

If none of the above works:

1. Double-check your account status on Veriff dashboard
2. Verify your API access is enabled
3. Contact Veriff support: support@veriff.com
4. Provide them with:
   - Your account email
   - The error message
   - A sample request (without sensitive data)

## Quick Verification Steps

Run these commands to verify your setup:

```bash
# 1. Check if .env exists
ls -la .env

# 2. Check if .env has the variables (without showing values)
grep VERIFF .env

# 3. Restart your app
npm run start:dev

# 4. Test health endpoint
curl http://localhost:3000/veriff/health

# 5. Check the logs when you make a request
# Look for the debug output in your terminal
```

## Still Getting 404?

If you've tried everything above and still getting 404:

1. **Verify the exact error message** - paste the full response
2. **Check the request URL** - add debug logging to see the exact URL being called
3. **Verify API credentials** - make sure you're copying them correctly from Veriff dashboard
4. **Check account status** - ensure your Veriff account is active and API access is enabled

Need more help? Check the full documentation in [README.md](README.md) or create an issue with:
- Full error message
- Debug logs (with credentials redacted)
- Your environment (Node version, OS, etc.)
