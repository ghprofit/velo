# Payout API Endpoints

## For Creators

### 1. Setup Bank Account (Required First)
```
POST /api/creators/payout/setup
Authorization: Bearer <jwt_token>

Body:
{
  "bankAccountName": "John Doe",
  "bankName": "Bank of America",
  "bankAccountNumber": "1234567890",
  "bankRoutingNumber": "021000021",  // For US banks
  "bankSwiftCode": "BOFAUS3N",       // For international (optional)
  "bankIban": "GB29NWBK60161331926819", // For EU (optional)
  "bankCountry": "US",
  "bankCurrency": "USD"
}

Response:
{
  "success": true,
  "message": "Bank account setup completed successfully",
  "data": {
    "bankAccountName": "John Doe",
    "bankName": "Bank of America",
    "bankAccountNumber": "****7890",
    "bankCountry": "US",
    "bankCurrency": "USD",
    "payoutSetupCompleted": true,
    "stripeAccountId": "acct_xxxxx"  // Automatically created
  }
}
```

### 2. Get Bank Account Info
```
GET /api/creators/payout/info
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "bankAccountName": "John Doe",
    "bankName": "Bank of America",
    "bankAccountNumber": "****7890",
    "bankCountry": "US",
    "bankCurrency": "USD",
    "payoutSetupCompleted": true,
    "stripeAccountId": "acct_xxxxx"
  }
}
```

### 3. Get Stripe Account Status (NEW)
```
GET /api/creators/payout/stripe-status
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "hasAccount": true,
    "onboardingComplete": true,
    "chargesEnabled": false,
    "payoutsEnabled": true,
    "requiresAction": false,
    "accountId": "acct_xxxxx"
  }
}
```

### 4. Get Stripe Onboarding Link (NEW)
```
GET /api/creators/payout/stripe-onboarding
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": {
    "url": "https://connect.stripe.com/setup/...",
    "expiresAt": "2026-01-15T12:00:00Z"
  }
}

Notes:
- This link is for completing additional Stripe onboarding if required
- Links expire after a short time (usually 30 minutes)
- After completing onboarding, Stripe redirects to: /creator/settings?tab=payout&success=true
```

### 5. Request Payout
```
POST /api/creators/payout/request
Authorization: Bearer <jwt_token>

Requirements:
✅ Email verified
✅ KYC verified (Veriff)
✅ Bank details setup (payoutSetupCompleted = true)

Body:
{
  "amount": 250.00
}

Response:
{
  "success": true,
  "message": "Payout request submitted successfully...",
  "data": {
    "id": "payout_req_xxxxx",
    "requestedAmount": 250.00,
    "availableBalance": 500.00,
    "currency": "USD",
    "status": "PENDING",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}

Errors:
- 403 Forbidden: "Bank details setup" - Call POST /api/creators/payout/setup first
- 400 Bad Request: "Minimum payout amount is $100"
- 400 Bad Request: "Insufficient balance"
```

### 6. Get Payout Requests
```
GET /api/creators/payout/requests
Authorization: Bearer <jwt_token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "payout_req_xxxxx",
      "requestedAmount": 250.00,
      "availableBalance": 500.00,
      "currency": "USD",
      "status": "APPROVED",
      "reviewedAt": "2026-01-15T11:00:00Z",
      "reviewNotes": "Approved for processing",
      "createdAt": "2026-01-15T10:30:00Z",
      "payout": {
        "id": "payout_xxxxx",
        "amount": 250.00,
        "status": "PROCESSING",
        "processedAt": null,
        "paymentId": "po_xxxxx"  // Stripe payout ID
      }
    }
  ]
}
```

---

## For Admins

### 7. Get Payout Requests (Admin)
```
GET /api/admin/payments/payout-requests
Authorization: Bearer <admin_jwt_token>

Query Params:
- status: PENDING | APPROVED | REJECTED
- page: 1
- limit: 10

Response:
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### 8. Approve Payout Request
```
POST /api/admin/payments/payout-requests/approve
Authorization: Bearer <admin_jwt_token>

Body:
{
  "requestId": "payout_req_xxxxx",
  "reviewNotes": "Approved - all checks passed"
}

Response:
{
  "success": true,
  "message": "Payout request approved",
  "data": {
    "request": {...},
    "payout": {
      "id": "payout_xxxxx",
      "status": "PENDING",  // Ready for processing
      ...
    }
  }
}
```

### 9. Process Payout (Admin) - Sends Real Money!
```
POST /api/admin/payments/payouts/process
Authorization: Bearer <admin_jwt_token>

Body:
{
  "payoutId": "payout_xxxxx"
}

Response:
{
  "success": true,
  "message": "Payout processed successfully",
  "data": {
    "id": "payout_xxxxx",
    "amount": 250.00,
    "status": "PROCESSING",  // or COMPLETED if instant
    "paymentId": "po_1AbCdE2FgHiJ3KlM",  // Stripe payout ID
    "stripeStatus": "in_transit",
    "estimatedArrival": "01/18/2026"  // 1-3 business days
  }
}

Errors:
- 404: Payout not found
- 400: Cannot process payout with status: COMPLETED
- 400: Creator does not have a connected payout account
- 400: Creator Stripe account is not fully set up
- 400: Failed to process payout: <Stripe error message>
```

---

## Error Resolution

### Error: "Bank details setup"
**Solution:** Call `POST /api/creators/payout/setup` with bank account details

### Error: "Creator does not have a connected payout account"
**Solution:** Bank setup failed. Re-submit bank details to create Stripe account

### Error: "Creator Stripe account is not fully set up"
**Solution:**
1. Check status: `GET /api/creators/payout/stripe-status`
2. Get onboarding link: `GET /api/creators/payout/stripe-onboarding`
3. Complete Stripe onboarding in browser

### Error: "Minimum payout amount is $100"
**Solution:** Request at least $100

### Error: "Insufficient balance"
**Solution:** Wait for more purchases or request a smaller amount

---

## Complete Flow

### Creator Setup (One-time):
1. ✅ Verify email
2. ✅ Complete KYC (Veriff)
3. ✅ **Setup bank account** → `POST /api/creators/payout/setup`
   - Automatically creates Stripe Connect account
4. ⚠️ (Optional) Complete Stripe onboarding if required → `GET /api/creators/payout/stripe-onboarding`

### Request Payout:
1. Creator: `POST /api/creators/payout/request` → Creates PayoutRequest (PENDING)
2. Admin: `POST /api/admin/payments/payout-requests/approve` → Creates Payout (PENDING)
3. Admin: `POST /api/admin/payments/payouts/process` → **Sends money via Stripe!**
   - Status changes: PENDING → PROCESSING → COMPLETED (via webhook)
   - Money arrives in 1-3 business days

---

## Next Steps

1. **Frontend**: Create bank account setup form that calls `POST /api/creators/payout/setup`
2. **Frontend**: Show Stripe onboarding link if `requiresAction: true`
3. **Backend**: Implement Stripe webhooks to auto-update payout status
4. **Testing**: Use Stripe test mode to verify flow end-to-end
