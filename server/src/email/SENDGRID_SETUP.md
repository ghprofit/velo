# SendGrid Email Template Setup

This application uses a **single SendGrid dynamic template** with a `{{{message}}}` placeholder for all email types. All email content and HTML structure is generated server-side and passed to this placeholder.

## Why Single Template?

- **Centralized Management**: One template to maintain in SendGrid
- **Flexibility**: All HTML structure controlled in code
- **Consistency**: Guaranteed consistent styling across all emails
- **Version Control**: Email templates tracked in Git
- **Easy Updates**: Change email designs without touching SendGrid

## Setup Instructions

### 1. Create SendGrid Dynamic Template

1. Log in to your [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Email API** → **Dynamic Templates**
3. Click **Create a Dynamic Template**
4. Name it: **"Velo Email Template"** (or any name you prefer)
5. Click **Add Version** → **Blank Template** → **Code Editor**

### 2. Template HTML

Paste this minimal HTML into the SendGrid template editor:

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  {{{message}}}
</body>
</html>
```

**Important Notes:**
- The triple braces `{{{message}}}` are crucial - they tell SendGrid NOT to escape HTML
- Do NOT add any other styling or structure
- The `{{{message}}}` placeholder will receive complete HTML documents with their own styling

### 3. Get Template ID

After saving the template:

1. Click on your template name in the Dynamic Templates list
2. Copy the **Template ID** (starts with `d-`)
3. It will look like: `d-1234567890abcdef1234567890abcdef`

### 4. Configure Environment Variables

Add these to your `.env` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_TEMPLATE_ID=d-your_template_id_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Velo
SENDGRID_REPLY_TO_EMAIL=support@yourdomain.com  # Optional

# Client URL (for email links)
CLIENT_URL=https://yourdomain.com
```

### 5. Verify SendGrid API Key

Ensure your SendGrid API Key has these permissions:
- ✅ Mail Send - Full Access
- ✅ Template Engine - Read Access

## How It Works

### Email Flow

1. **Code generates HTML**: Your application generates complete HTML emails using the `HTML_TEMPLATES` in `email-templates.ts`
2. **Pass to SendGrid**: The HTML is sent to SendGrid's API with `templateData: { message: htmlContent }`
3. **SendGrid injects HTML**: SendGrid puts the HTML into the `{{{message}}}` placeholder
4. **Email delivered**: Recipient receives the fully-styled email

### Example

```typescript
// Generate complete HTML from template
const htmlMessage = HTML_TEMPLATES.WELCOME({ user_name: 'John' });

// Send to SendGrid
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Velo!',
  templateId: 'd-your-template-id',
  templateData: {
    message: htmlMessage  // Complete HTML goes here
  }
});
```

## Available Email Types

All email types are defined in `email-templates.ts`:

### User Authentication
- `WELCOME` - Welcome new users
- `EMAIL_VERIFICATION` - Verify email address
- `PASSWORD_RESET` - Reset password link
- `ACCOUNT_VERIFIED` - Confirmation of verification
- `PASSWORD_CHANGED` - Password change notification

### Security
- `TWO_FACTOR_ENABLED` - 2FA enabled notification
- `TWO_FACTOR_DISABLED` - 2FA disabled notification
- `SECURITY_ALERT` - Suspicious activity alert

### Purchases (Buyer)
- `PURCHASE_RECEIPT` - Purchase confirmation and receipt

### Creator Notifications
- `CREATOR_SALE_NOTIFICATION` - New sale notification
- `PAYOUT_PROCESSED` - Payout processed notification
- `CONTENT_APPROVED` - Content approved for publication
- `CONTENT_REJECTED` - Content rejected with reason

### Support
- `SUPPORT_TICKET_RECEIVED` - Ticket received confirmation
- `SUPPORT_TICKET_REPLY` - Support team reply notification

### Other
- `ACCOUNT_DELETION` - Account deletion confirmation
- `NEWSLETTER` - Newsletter emails

## Usage Examples

### Send Welcome Email

```typescript
await emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

### Send Purchase Receipt

```typescript
await emailService.sendPurchaseReceipt(
  'buyer@example.com',
  {
    buyer_email: 'buyer@example.com',
    content_title: 'Premium Video Course',
    amount: '49.99',
    date: new Date().toLocaleDateString(),
    access_link: 'https://velo.com/c/123?token=xyz',
    transaction_id: 'txn_123456'
  }
);
```

### Send Creator Sale Notification

```typescript
await emailService.sendCreatorSaleNotification(
  'creator@example.com',
  {
    creator_name: 'Jane Smith',
    content_title: 'Premium Video Course',
    amount: '49.99',
    date: new Date().toLocaleDateString()
  }
);
```

### Send Custom Template Email

```typescript
await emailService.sendTemplateEmail(
  'user@example.com',
  'PASSWORD_RESET',
  {
    user_name: 'John',
    reset_link: 'https://velo.com/reset?token=xyz',
    expiry_time: '30 minutes'
  }
);
```

## Testing

### Test Configuration

```typescript
// Test if SendGrid is properly configured
await emailService.testConfiguration('your-test-email@example.com');
```

This sends a simple test email to verify:
- ✅ API key is valid
- ✅ From email is configured
- ✅ SendGrid can send emails

### Development Mode

If `SENDGRID_API_KEY` is not set, emails will be **simulated** (logged to console instead of sent). This is useful for local development.

## Customizing Email Templates

### Modify Existing Templates

Edit the HTML generators in `server/src/email/templates/email-templates.ts`:

```typescript
export const HTML_TEMPLATES = {
  WELCOME: (data: { user_name: string }) => `
    <!DOCTYPE html>
    <html>
      <!-- Your custom HTML here -->
      <body>
        <h1>Welcome ${data.user_name}!</h1>
        <!-- More content -->
      </body>
    </html>
  `,
  // ... other templates
};
```

### Add New Email Type

1. **Add to EMAIL_TEMPLATES**:
```typescript
export const EMAIL_TEMPLATES = {
  MY_NEW_EMAIL: {
    id: SENDGRID_TEMPLATE_ID,
    name: 'My New Email',
    description: 'Description of email',
    subject: 'Email Subject',
    requiredVariables: ['var1', 'var2'],
  } as EmailTemplate,
};
```

2. **Add HTML Generator**:
```typescript
export const HTML_TEMPLATES = {
  MY_NEW_EMAIL: (data: { var1: string; var2: string }) => `
    <!DOCTYPE html>
    <!-- Your HTML template -->
  `,
};
```

3. **Add Helper Method** (optional):
```typescript
async sendMyNewEmail(
  to: string,
  var1: string,
  var2: string,
): Promise<EmailSendResult> {
  return this.sendHTMLTemplateEmail(
    to,
    'MY_NEW_EMAIL',
    { var1, var2 },
    'Email Subject'
  );
}
```

## Common Styling Tips

### Responsive Design

```html
<style>
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .button { display: block !important; width: 100% !important; }
  }
</style>
```

### Button Styling

```html
<a href="{{link}}" style="display: inline-block; padding: 14px 32px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
  Click Here
</a>
```

### Color Boxes

```html
<!-- Success Box -->
<div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
  <p style="margin: 0;">Success message here</p>
</div>

<!-- Warning Box -->
<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
  <p style="margin: 0;">Warning message here</p>
</div>

<!-- Danger Box -->
<div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
  <p style="margin: 0;">Danger message here</p>
</div>
```

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `SENDGRID_API_KEY` is correct
2. **Check Template ID**: Verify `SENDGRID_TEMPLATE_ID` matches your SendGrid template
3. **Check Permissions**: Ensure API key has "Mail Send" permission
4. **Check From Email**: Verify your domain or use SendGrid's domain
5. **Check Logs**: Look for errors in server logs

### Emails Look Wrong

1. **Inline Styles**: Always use inline styles, not CSS classes
2. **Triple Braces**: Ensure SendGrid template uses `{{{message}}}` not `{{message}}`
3. **DOCTYPE**: Include proper DOCTYPE in each HTML template
4. **Test Clients**: Test in multiple email clients (Gmail, Outlook, etc.)

### Template Not Found Error

```
BadRequestException: Template XYZ not found
```

**Solution**: Ensure the template key exists in both `EMAIL_TEMPLATES` and `HTML_TEMPLATES`

## Best Practices

1. **Always use inline styles** - Email clients strip out `<style>` tags
2. **Test in multiple clients** - Gmail, Outlook, Apple Mail behave differently
3. **Keep it simple** - Complex layouts may break in some email clients
4. **Use tables for layout** - More reliable than divs in emails
5. **Provide alt text** - For images (though we don't use many)
6. **Include plain text fallback** - Some users prefer plain text
7. **Track opens/clicks** - Use SendGrid's analytics features

## Security Notes

- Never include sensitive data in email subjects
- Use HTTPS for all links
- Implement rate limiting for email sending
- Validate email addresses before sending
- Use unique, expiring tokens for password resets

## Support

For SendGrid-specific issues:
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Support](https://support.sendgrid.com/)

For template issues:
- Check `server/src/email/templates/email-templates.ts`
- Review `server/src/email/email.service.ts`
