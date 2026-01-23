# Invoice Email Testing Guide

## Quick Test: Resend Invoice

If a user didn't receive their invoice, you can manually resend it using the new endpoint:

### Using cURL

```bash
curl -X POST http://localhost:8000/buyer/invoice/resend \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": "your_purchase_id_here",
    "email": "buyer@example.com"
  }'
```

### Expected Response (Success)
```json
{
  "success": true,
  "message": "Invoice sent successfully",
  "messageId": "abc123def456@smtp.zoho.com"
}
```

### Expected Response (Error - Email doesn't match)
```json
{
  "statusCode": 401,
  "message": "Email does not match purchase record",
  "error": "Unauthorized"
}
```

---

## Full Testing Workflow

### 1. **Check Email Configuration**

First, verify the email service is configured:

```bash
# Check if Zoho credentials are set
echo $ZOHO_EMAIL
echo $ZOHO_PASSWORD  # Should be set, don't display
```

In [server/.env](server/.env):
```env
ZOHO_EMAIL=noreply@velolink.club
ZOHO_PASSWORD=GodDidVeloLLC.
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465
```

### 2. **Simulate a Complete Purchase (Development)**

Create a test purchase:

```bash
# Step 1: Create a buyer session
curl -X POST http://localhost:8000/buyer/session \
  -H "Content-Type: application/json" \
  -d '{
    "fingerprint": "test-fingerprint-123"
  }'

# Response will include sessionToken
# Copy the sessionToken for next step
```

```bash
# Step 2: Create a purchase (NOW WITH REQUIRED EMAIL)
curl -X POST http://localhost:8000/buyer/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "contentId": "your_content_id",
    "sessionToken": "your_session_token_from_step_1",
    "email": "testbuyer@example.com",
    "fingerprint": "test-fingerprint-123"
  }'

# If email is missing, you'll get:
# {
#   "statusCode": 400,
#   "message": "email should not be empty",
#   "error": "Bad Request"
# }
```

### 3. **Check Server Logs for Email Sending**

The server should log:

**During payment processing:**
```
[STRIPE] Payment succeeded: pi_xxxxx
[EMAIL] Sending purchase receipt to testbuyer@example.com for purchase purc_xxxxx
[EMAIL] ✅ Purchase receipt sent successfully to testbuyer@example.com. MessageId: xxx@smtp.zoho.com
```

**If email is missing:**
```
⚠️ INVOICE EMAIL ISSUE: No email found for buyerSession sess_xxxxx. Invoice will NOT be sent! Payment Intent: pi_xxxxx
```

### 4. **Real Stripe Payment Test**

For testing with actual Stripe payments:

#### Test Credit Card Numbers
- **Visa Success**: `4242 4242 4242 4242`
- **Visa Decline**: `4000 0000 0000 0002`
- **3D Secure Required**: `4000 0025 0000 3155`

Any expiry date in the future, any CVC

#### Test Webhook

Stripe test mode webhooks can be simulated:

```bash
# In Stripe Dashboard:
# Settings → Webhooks → Select your webhook endpoint
# Click "Send test event"
# Select "payment_intent.succeeded"
```

Check server logs for webhook processing.

---

## Debugging Email Issues

### Problem: Email not sending but no errors

1. **Check email configuration**
   - Verify `ZOHO_EMAIL` and `ZOHO_PASSWORD` in `.env`
   - Verify `ZOHO_SMTP_HOST` is `smtp.zoho.com`
   - Verify `ZOHO_SMTP_PORT` is `465`

2. **Check buyer session has email**
   ```sql
   SELECT id, email, expiresAt FROM buyer_sessions 
   WHERE id = 'your_session_id';
   ```
   If `email` is NULL, that's the problem!

3. **Check purchase record**
   ```sql
   SELECT id, buyerSessionId, status, createdAt 
   FROM purchases 
   WHERE id = 'your_purchase_id';
   ```

4. **Resend manually**
   ```bash
   curl -X POST http://localhost:8000/buyer/invoice/resend \
     -H "Content-Type: application/json" \
     -d '{
       "purchaseId": "your_purchase_id",
       "email": "buyer@example.com"
     }'
   ```

5. **Check logs for response**
   - Look for `[EMAIL] ✅` or `[EMAIL] ❌` messages
   - Note the MessageId for tracking

### Problem: Getting "email should not be empty" error

This is **expected** - the API now requires email!

**Solution**: Frontend must capture email during checkout

```typescript
// Before sending purchase request, validate:
if (!email || !email.includes('@')) {
  // Show error message to user
  throw new Error('Valid email is required');
}

// Then send purchase with email:
const response = await fetch('/buyer/purchase', {
  method: 'POST',
  body: JSON.stringify({
    contentId: id,
    sessionToken: session.sessionToken,
    email: email,  // ← REQUIRED NOW
    fingerprint: browserFingerprint
  })
});
```

### Problem: "Email does not match purchase record"

When calling resend invoice:

```bash
curl -X POST http://localhost:8000/buyer/invoice/resend \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": "purchase_xyz",
    "email": "different@email.com"  # ← WRONG EMAIL
  }'
```

**Solution**: Use the correct email that was used during purchase

```bash
# Find the correct email
SELECT bs.email 
FROM purchases p 
JOIN buyer_sessions bs ON p.buyerSessionId = bs.id 
WHERE p.id = 'purchase_xyz';

# Then use that email in resend request
curl -X POST http://localhost:8000/buyer/invoice/resend \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": "purchase_xyz",
    "email": "correctbuyer@example.com"
  }'
```

---

## Email Content Verification

The purchase receipt email should include:

- ✅ "Purchase Successful!" header
- ✅ Purchase details (content title, amount, date, email)
- ✅ "Access Your Content" button with access link
- ✅ Receipt ID / Transaction ID
- ✅ Footer with copyright

**Sample Email Structure**:
```
┌─────────────────────────────────┐
│         VELOLINK LOGO            │
│   🎉 Purchase Successful!        │
├─────────────────────────────────┤
│ Thank you for your purchase!     │
│                                 │
│ Purchase Details                 │
│ ─────────────────────────────   │
│ Content: Premium Video Course    │
│ Amount: $49.99                   │
│ Date: 1/23/2026                 │
│ Email: buyer@example.com         │
│                                 │
│ [ACCESS YOUR CONTENT]            │
│                                 │
│ 💡 Tip: Bookmark your link...   │
├─────────────────────────────────┤
│ © 2026 Velo. All rights reserved │
│ Receipt ID: pi_1234567890       │
└─────────────────────────────────┘
```

---

## Performance Considerations

- **Email sending is NOT blocking**: Purchase completes immediately, email sends in background
- **Rate limiting on resend**: 5 requests per hour per IP to prevent spam
- **Email retry**: If Zoho fails, the email is logged but not automatically retried
- **Webhook processing**: Retried by Stripe if we return non-2xx status

---

## Database Queries for Troubleshooting

### Find purchases without emails
```sql
SELECT p.id, p.paymentIntentId, bs.email, p.createdAt
FROM purchases p
LEFT JOIN buyer_sessions bs ON p.buyerSessionId = bs.id
WHERE bs.email IS NULL
ORDER BY p.createdAt DESC;
```

### Find recent purchases
```sql
SELECT 
  p.id, 
  p.contentId, 
  bs.email, 
  p.status, 
  p.createdAt
FROM purchases p
LEFT JOIN buyer_sessions bs ON p.buyerSessionId = bs.id
WHERE p.createdAt > NOW() - INTERVAL '24 hours'
ORDER BY p.createdAt DESC
LIMIT 20;
```

### Find failed purchases
```sql
SELECT 
  p.id, 
  p.paymentIntentId, 
  p.status, 
  p.createdAt,
  bs.email
FROM purchases p
LEFT JOIN buyer_sessions bs ON p.buyerSessionId = bs.id
WHERE p.status != 'COMPLETED'
ORDER BY p.createdAt DESC;
```

---

## Related Files

- [EMAIL_INVOICE_FIX.md](EMAIL_INVOICE_FIX.md) - Full documentation of the fix
- [server/src/buyer/buyer.service.ts](server/src/buyer/buyer.service.ts) - Resend invoice implementation
- [server/src/stripe/stripe.controller.ts](server/src/stripe/stripe.controller.ts) - Webhook email logic
- [server/src/email/email.service.ts](server/src/email/email.service.ts) - Email sending implementation
- [server/src/email/SENDGRID_SETUP.md](server/src/email/SENDGRID_SETUP.md) - Email configuration guide

---

## Quick Reference: Email Flow

```
User completes payment
         ↓
Stripe processes charge successfully
         ↓
[payment_intent.succeeded webhook]
         ↓
Server finds/creates purchase record
         ↓
Check: Does buyerSession have email?
    ├─ YES → Send invoice email ✅
    └─ NO  → Log warning ⚠️ (no email sent)
         ↓
Purchase marked as COMPLETED
         ↓
User has access to content
```

---

**Last Updated**: January 23, 2026
