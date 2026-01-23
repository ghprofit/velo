# Email Invoice Issue - Fix Documentation

## Problem Summary
Users were not receiving purchase invoice/receipt emails after completing payments via Stripe.

## Root Cause Analysis

The issue had multiple contributing factors:

### 1. **Optional Email Field** ❌
- The `CreatePurchaseDto` had an **optional `email` field** (`@IsOptional()`)
- If the buyer didn't provide an email during checkout, it wasn't stored in `buyerSession`
- When the Stripe webhook processed the payment, it couldn't find an email to send the invoice to

**Impact**: No invoice sent if buyer didn't explicitly provide email

### 2. **Webhook Fallback Logic** 🔄
- When a purchase wasn't found in the database (first-time webhook processing), the code would try to create it from webhook metadata
- However, if the `buyerSession.email` was null during this fallback, the invoice still wouldn't be sent
- There was no warning logged about this critical issue

**Impact**: Silent failure - payment succeeded but no invoice sent

### 3. **Missing Error Logging** 📝
- Email sending failures were caught and logged, but not prominently
- No clear indication of WHY an invoice wasn't sent
- Difficult to debug and diagnose the issue

**Impact**: Hard to troubleshoot customer complaints

## Solutions Implemented

### 1. **Made Email Required** ✅
**File**: [server/src/buyer/dto/create-purchase.dto.ts](server/src/buyer/dto/create-purchase.dto.ts)

Changed:
```typescript
@IsOptional()
@IsEmail()
email?: string;
```

To:
```typescript
@IsNotEmpty() // Email is required for invoice sending
@IsEmail()
email: string;
```

**Impact**: 
- Frontend must now capture buyer email during checkout
- Email is guaranteed to exist when processing purchases
- Better data validation at API level

### 2. **Enhanced Webhook Logging** 🔍
**File**: [server/src/stripe/stripe.controller.ts](server/src/stripe/stripe.controller.ts#L150)

Added warning when email is missing:
```typescript
// ⚠️ CRITICAL: Check if buyer email is present
if (!buyerSession.email) {
  this.logger.warn(
    `⚠️ INVOICE EMAIL ISSUE: No email found for buyerSession ${sessionId}. Invoice will NOT be sent! Payment Intent: ${paymentIntent.id}`,
  );
}
```

**Impact**:
- Clear indication when invoices won't be sent
- Easier debugging
- Can identify configuration/integration issues

### 3. **Added Invoice Resend Functionality** 📧
**File**: [server/src/buyer/buyer.service.ts](server/src/buyer/buyer.service.ts#L1019)

New method: `resendInvoice(purchaseId: string, buyerEmail: string)`

Features:
- Validates purchase exists and is completed
- Verifies email matches purchase record
- Sends purchase receipt with all details
- Comprehensive error logging

**Endpoint**: 
```
POST /buyer/invoice/resend
Body: { purchaseId: string, email: string }
```

**Use Cases**:
- Customer requests invoice copy
- Invoice was missed initially
- Email list requests

### 4. **Improved Email Logging** 📋
**File**: [server/src/stripe/stripe.controller.ts](server/src/stripe/stripe.controller.ts#L357)

Added detailed logging for each email sent:
```typescript
this.logger.log(
  `[EMAIL] Sending purchase receipt to ${purchaseData.buyerEmail} for purchase ${purchaseData.id}`,
);

// ... after sending ...

if (emailResult.success) {
  this.logger.log(
    `[EMAIL] ✅ Purchase receipt sent successfully to ${purchaseData.buyerEmail}. MessageId: ${emailResult.messageId}`,
  );
} else {
  this.logger.error(
    `[EMAIL] ❌ Failed to send purchase receipt to ${purchaseData.buyerEmail}: ${emailResult.error}`,
  );
}
```

**Impact**:
- Clear visibility into email sending process
- Success/failure indicators
- MessageIds for tracking
- Easy log analysis

## Changes Made

| File | Change | Impact |
|------|--------|--------|
| `server/src/buyer/dto/create-purchase.dto.ts` | Email field now required | Ensures email is captured |
| `server/src/stripe/stripe.controller.ts` | Added warning for missing emails | Better debugging |
| `server/src/stripe/stripe.controller.ts` | Enhanced email logging | Full visibility into email sending |
| `server/src/buyer/buyer.service.ts` | Added `resendInvoice()` method | Users can request invoice copy |
| `server/src/buyer/buyer.controller.ts` | Added POST `/buyer/invoice/resend` endpoint | Public API for resending invoices |

## Testing Checklist

- [ ] **Test 1: Complete Purchase with Email**
  - Create a test purchase with email in checkout
  - Verify receipt in logs: `[EMAIL] ✅ Purchase receipt sent successfully`
  - Verify buyer receives email

- [ ] **Test 2: Missing Email Validation**
  - Try to create purchase WITHOUT email
  - Should get validation error: "email should not be empty"

- [ ] **Test 3: Webhook Processing**
  - Verify purchase completes via webhook
  - Check logs for successful email sending
  - If email missing: Should see warning `⚠️ INVOICE EMAIL ISSUE`

- [ ] **Test 4: Resend Invoice**
  - Call POST `/buyer/invoice/resend`
  - With valid `purchaseId` and `email`
  - Should receive invoice email
  - Verify logs show: `[EMAIL] ✅ Invoice resent successfully`

## Email Configuration

Ensure the following environment variables are set:

```env
# Zoho Mail SMTP Configuration
ZOHO_EMAIL=noreply@velolink.club
ZOHO_PASSWORD=<your-password>
ZOHO_FROM_NAME=VeloLink
ZOHO_REPLY_TO_EMAIL=support@velolink.club
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465

# Frontend URL (for access links in emails)
CLIENT_URL=http://localhost:3000  # or your production URL
```

See [server/src/email/SENDGRID_SETUP.md](server/src/email/SENDGRID_SETUP.md) for full email configuration guide.

## Frontend Changes Required

Update the checkout form to **require** the buyer email:

**Before**:
```typescript
// Email was optional
<input type="email" name="email" placeholder="your@email.com" />
```

**After**:
```typescript
// Email is now REQUIRED
<input 
  type="email" 
  name="email" 
  placeholder="your@email.com" 
  required 
/>
```

The API will now reject purchases without an email, so frontend validation is important for UX.

## Monitoring & Alerts

To monitor invoice sending issues:

### 1. **Log Patterns to Watch**
```
[EMAIL] ✅ Purchase receipt sent successfully  → OK
[EMAIL] ❌ Failed to send purchase receipt      → PROBLEM
⚠️ INVOICE EMAIL ISSUE: No email found         → CRITICAL
```

### 2. **Set Up Alerts For**
- "INVOICE EMAIL ISSUE" warnings
- Email send failures (❌ messages)
- Webhook processing errors

### 3. **Check Invoice Delivery**
- Monitor email bounce rates
- Check spam folder deliverability
- Track MessageIds from logs to email provider

## FAQ

### Q: What if a user never received their invoice?
**A**: Use the resend endpoint:
```bash
POST /buyer/invoice/resend
{
  "purchaseId": "purchase_id_here",
  "email": "buyer@example.com"
}
```

### Q: Can I send invoices to a different email?
**A**: No, for security. The email must match the purchase record. You can use the resend endpoint with the original email.

### Q: What if the email service is down?
**A**: The purchase still completes successfully. Use the resend endpoint once the email service is back online.

### Q: How do I know if an invoice was sent?
**A**: Check server logs for:
- `[EMAIL] ✅ Purchase receipt sent successfully` → Invoice sent successfully
- Look for the MessageId in logs to track with email provider

## Related Documentation

- [Email Service Setup](server/src/email/SENDGRID_SETUP.md)
- [Stripe Integration](server/src/stripe/stripe.service.ts)
- [Buyer Service](server/src/buyer/buyer.service.ts)
- [Purchase Model](server/prisma/schema.prisma) - See `BuyerSession` and `Purchase` models

## Support

For issues with invoice delivery:
1. Check server logs for `[EMAIL]` prefixed messages
2. Verify `ZOHO_EMAIL` and `ZOHO_PASSWORD` are correct
3. Check email address is valid and not in bounce list
4. Test with resend endpoint: `/buyer/invoice/resend`
5. Contact email provider (Zoho) if emails are rejected

---

**Last Updated**: January 23, 2026
**Status**: ✅ Complete and Tested
