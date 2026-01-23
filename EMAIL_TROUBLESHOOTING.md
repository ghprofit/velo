# Troubleshooting: Purchase Email Not Received

## Diagnosis Steps

If you're not receiving purchase invoices after completing a payment, follow these steps:

### Step 1: Check Server Logs for Email Sending

Look in your server console for these log patterns:

**✅ Success Pattern:**
```
[PURCHASE] Updating session with email: user@example.com
[PURCHASE] ✅ Session email updated successfully
[EMAIL] Sending purchase receipt to user@example.com for purchase purc_xyz
[EMAIL] ✅ Purchase receipt sent successfully to user@example.com. MessageId: abc123@smtp.zoho.com
```

**❌ Failure Patterns:**
```
[PURCHASE] ⚠️ No email provided in purchase request!
[EMAIL] ⚠️ No buyer email found for purchase purc_xyz. Invoice NOT sent!
[EMAIL] ❌ Failed to send purchase receipt: Connection timeout
```

### Step 2: Verify Email Configuration

Check that Zoho email is properly configured:

```powershell
# On Windows, check the .env file:
cd server
type .env | findstr ZOHO
```

Should show:
```
ZOHO_EMAIL=noreply@velolink.club
ZOHO_PASSWORD=GodDidVeloLLC.
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465
```

### Step 3: Check Buyer Session in Database

Verify the email was saved to the buyer session:

```sql
SELECT id, email, createdAt, expiresAt FROM buyer_sessions 
WHERE createdAt > NOW() - INTERVAL '1 hour'
ORDER BY createdAt DESC
LIMIT 5;
```

If `email` column is NULL, the email wasn't captured during checkout.

### Step 4: Check Purchase Record

Verify the purchase was completed:

```sql
SELECT 
  p.id, 
  p.paymentIntentId, 
  p.status, 
  p.createdAt,
  bs.email,
  c.title
FROM purchases p
LEFT JOIN buyer_sessions bs ON p.buyerSessionId = bs.id
LEFT JOIN content c ON p.contentId = c.id
WHERE p.status = 'COMPLETED'
ORDER BY p.createdAt DESC
LIMIT 5;
```

### Step 5: Manually Resend Invoice

Once you've identified the purchase ID and email, use the resend endpoint:

```bash
curl -X POST http://localhost:8000/buyer/invoice/resend \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": "purc_xxxxx",
    "email": "buyer@example.com"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Invoice sent successfully",
  "messageId": "xyz123@smtp.zoho.com"
}
```

---

## Common Issues & Solutions

### Issue 1: Email is NULL in buyerSession

**Symptom**: Database shows NULL email in buyer_sessions table

**Root Cause**: Email wasn't provided or wasn't captured during checkout

**Solution**: 
- Ensure email field is filled in on the checkout page
- Check frontend logs: `[CHECKOUT] Email: user@example.com`
- If blank, user needs to re-enter it

### Issue 2: Email validation error "email should not be empty"

**Symptom**: Purchase creation fails with validation error

**Root Cause**: API now requires email, but client is sending empty/undefined

**Solution**:
- The checkout form must require email before payment
- Email should be validated on frontend BEFORE creating purchase
- Check if `<input required>` is in the checkout form

### Issue 3: Zoho SMTP Connection Fails

**Symptom**: Logs show `ZOHO_MAIL_SMTP verification failed`

**Root Cause**: 
- Wrong email/password credentials
- Zoho Mail account locked or disabled
- Network firewall blocking SMTP port 465

**Solution**:
1. Verify Zoho credentials are correct
2. Test login at https://mail.zoho.com
3. Check firewall allows outbound SMTP (port 465)
4. Verify TLS settings are correct

### Issue 4: Email sent but not received by user

**Symptom**: Logs show ✅ success but user doesn't see email

**Root Cause**:
- Email in spam/junk folder
- Recipient email address is invalid/typo
- Email provider is rejecting Velo emails

**Solution**:
- Check spam folder and mark as "Not Spam"
- Verify email address is correct: `SELECT email FROM buyer_sessions WHERE id='xxx'`
- Check email bounce logs in Zoho Mail dashboard
- Test with a personal email address

---

## Email Sending Flow Diagram

```
User enters email in checkout form
         ↓
[CHECKOUT] Email: user@example.com
         ↓
User completes Stripe payment
         ↓
[payment_intent.succeeded] webhook triggered
         ↓
Server finds purchase in database
         ↓
[PURCHASE] Updating session with email: user@example.com
         ↓
[PURCHASE] ✅ Session email updated successfully
         ↓
[EMAIL] Sending purchase receipt to user@example.com
         ↓
Check: Is Zoho SMTP configured?
    ├─ YES → Connect to SMTP server
    │        ├─ Success → Send email ✅
    │        └─ Failure → Log error ❌
    └─ NO  → Simulate in development mode
         ↓
[EMAIL] ✅ Purchase receipt sent successfully. MessageId: xxx@smtp.zoho.com
         ↓
Email delivered to user's inbox
```

---

## Quick Test: Send Test Email

To verify Zoho Mail is working, send a test email:

**Using the resend endpoint (if you have a purchase):**
```bash
curl -X POST http://localhost:8000/buyer/invoice/resend \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": "any_purchase_id",
    "email": "your@email.com"
  }'
```

**Using direct email service (in development):**
```typescript
// In a test file or via API test tool
const result = await emailService.sendPurchaseReceipt('test@example.com', {
  buyer_email: 'test@example.com',
  content_title: 'Test Content',
  amount: '99.99',
  date: new Date().toLocaleDateString(),
  access_link: 'https://velo.com/c/test?token=xyz',
  transaction_id: 'pi_test123'
});

console.log(result);
// Should show: { success: true, messageId: '...' }
```

---

## Email Service Health Check

Create a health check endpoint to verify email configuration:

```bash
curl http://localhost:8000/buyer/health/email

# Should return:
{
  "zohoConfigured": true,
  "smtpHost": "smtp.zoho.com",
  "smtpPort": 465,
  "emailFrom": "noreply@velolink.club",
  "lastTestResult": "success",
  "testSentAt": "2026-01-23T12:00:00Z"
}
```

---

## Monitoring & Alerts

### Set Up Alerts For:

1. **Missing Email in Purchase**
   ```
   Pattern: "[PURCHASE] ⚠️ No email provided"
   Action: Notify admin
   ```

2. **Email Send Failure**
   ```
   Pattern: "[EMAIL] ❌ Failed to send"
   Action: Page on-call engineer
   ```

3. **SMTP Connection Error**
   ```
   Pattern: "ZOHO_MAIL_SMTP verification failed"
   Action: Critical alert - emails offline
   ```

---

## Testing Checklist

- [ ] Check server logs for email patterns
- [ ] Verify Zoho credentials in .env
- [ ] Query database for buyer_sessions with NULL email
- [ ] Check spam folder for missed emails
- [ ] Test with resend endpoint
- [ ] Verify SMTP connection (telnet to smtp.zoho.com:465)
- [ ] Check Zoho Mail dashboard for bounces/errors
- [ ] Test complete flow: checkout → payment → email

---

## Related Files

- [EMAIL_INVOICE_FIX.md](../EMAIL_INVOICE_FIX.md) - Implementation details
- [INVOICE_TESTING_GUIDE.md](../INVOICE_TESTING_GUIDE.md) - Testing guide
- [server/src/email/email.service.ts](../server/src/email/email.service.ts) - Email service
- [server/src/stripe/stripe.controller.ts](../server/src/stripe/stripe.controller.ts) - Webhook handling
- [server/.env](../server/.env) - Configuration file

---

## Support

For persistent issues:

1. **Collect Information:**
   - Server logs (last 50 lines with [EMAIL] and [PURCHASE])
   - Purchase ID and buyer email
   - Zoho Mail account status
   - Network connectivity to smtp.zoho.com

2. **Contact:**
   - Email: support@velolink.club
   - Include all collected information above

3. **Workaround:**
   - Use `/buyer/invoice/resend` endpoint to manually send
   - Provide this to customer as alternative

---

**Last Updated**: January 23, 2026
**Status**: Active - Use when customers report missing invoices
