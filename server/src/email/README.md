# Email Service Module

A comprehensive email service module for NestJS using SendGrid with support for single emails, bulk emails, templates, attachments, and scheduled sending.

## Features

- Single email sending with full customization
- Bulk email sending (up to 1000 recipients per batch)
- SendGrid template support with dynamic data
- Built-in HTML templates (fallback)
- Email attachments (files, inline images)
- Scheduled email sending
- Email verification templates
- Password reset templates
- Welcome email templates
- CC/BCC support
- Custom tracking arguments
- Development mode simulation (works without API key)
- Comprehensive validation
- Type-safe DTOs and interfaces

## Installation

The module is already installed with the required dependencies:

```bash
npm install @sendgrid/mail
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your App Name
SENDGRID_REPLY_TO_EMAIL=support@yourdomain.com
```

### Get SendGrid API Key

1. Sign up at [SendGrid](https://sendgrid.com)
2. Go to Settings > API Keys
3. Create a new API key with "Full Access" or "Mail Send" permissions
4. Copy the API key to your `.env` file

### Module Setup

The EmailModule is already added to your AppModule:

```typescript
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EmailModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## API Endpoints

### 1. Send Single Email
**POST** `/email/send`

Send a single email with full customization.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Hello from NestJS",
  "text": "Plain text content",
  "html": "<h1>HTML content</h1>",
  "from": "custom@example.com",
  "fromName": "Custom Name",
  "replyTo": "reply@example.com",
  "cc": ["cc1@example.com"],
  "bcc": ["bcc1@example.com"],
  "attachments": [
    {
      "content": "base64_encoded_content",
      "filename": "document.pdf",
      "type": "application/pdf",
      "disposition": "attachment"
    }
  ],
  "customArgs": {
    "campaignId": "spring-sale-2024",
    "userId": "12345"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_abc123",
  "message": "Email sent successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Send Template Email
**POST** `/email/send-template`

Send email using a SendGrid template.

**Request Body:**
```json
{
  "to": "user@example.com",
  "templateId": "d-1234567890abcdef",
  "templateData": {
    "userName": "John Doe",
    "orderNumber": "ORD-123",
    "totalAmount": "$99.99"
  },
  "from": "orders@example.com",
  "fromName": "Order System"
}
```

### 3. Send Bulk Emails
**POST** `/email/send-bulk`

Send emails to multiple recipients (up to 1000 per batch).

**Request Body:**
```json
{
  "recipients": [
    {
      "email": "user1@example.com",
      "templateData": {
        "userName": "User 1",
        "customField": "value1"
      }
    },
    {
      "email": "user2@example.com",
      "templateData": {
        "userName": "User 2",
        "customField": "value2"
      }
    }
  ],
  "subject": "Newsletter",
  "templateId": "d-newsletter-template",
  "commonTemplateData": {
    "companyName": "ACME Corp",
    "year": "2024"
  }
}
```

**Response:**
```json
{
  "success": true,
  "totalRecipients": 2,
  "successCount": 2,
  "failureCount": 0,
  "failures": [],
  "message": "Bulk email completed. 2/2 sent successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Send Welcome Email
**POST** `/email/welcome`

Send a pre-configured welcome email.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "userName": "John Doe"
}
```

### 5. Send Email Verification
**POST** `/email/verify`

Send email verification link.

**Request Body:**
```json
{
  "email": "user@example.com",
  "userName": "John Doe",
  "verificationLink": "https://yourapp.com/verify?token=abc123"
}
```

### 6. Send Password Reset
**POST** `/email/password-reset`

Send password reset link.

**Request Body:**
```json
{
  "email": "user@example.com",
  "userName": "John Doe",
  "resetLink": "https://yourapp.com/reset?token=xyz789"
}
```

### 7. Test Configuration
**POST** `/email/test`

Test your SendGrid configuration.

**Request Body:**
```json
{
  "email": "your-test@example.com"
}
```

### 8. Get Email Stats
**GET** `/email/stats/:days`

Get email statistics for the last N days.

**Example:** `GET /email/stats/7`

### 9. Health Check
**GET** `/email/health`

Check email service health.

**Response:**
```json
{
  "status": "ok",
  "service": "Email Service",
  "provider": "SendGrid",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Using in Your Code

### Inject EmailService

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Injectable()
export class UserService {
  constructor(private readonly emailService: EmailService) {}

  async registerUser(email: string, name: string) {
    // Create user...

    // Send welcome email
    await this.emailService.sendWelcomeEmail(email, name);

    // Or send custom email
    await this.emailService.sendEmail({
      to: email,
      subject: 'Welcome!',
      html: '<h1>Welcome to our platform!</h1>',
    });
  }
}
```

### Send Email with Attachment

```typescript
const fs = require('fs');

async sendInvoice(email: string, invoicePath: string) {
  const fileContent = fs.readFileSync(invoicePath);
  const base64Content = fileContent.toString('base64');

  await this.emailService.sendEmail({
    to: email,
    subject: 'Your Invoice',
    html: '<p>Please find your invoice attached.</p>',
    attachments: [
      {
        content: base64Content,
        filename: 'invoice.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  });
}
```

### Schedule Email

```typescript
async scheduleWelcomeEmail(email: string, userName: string) {
  const sendTime = new Date();
  sendTime.setHours(sendTime.getHours() + 24); // Send in 24 hours

  await this.emailService.scheduleEmail(
    {
      to: email,
      subject: 'Welcome!',
      html: `<h1>Hello ${userName}!</h1>`,
    },
    sendTime,
  );
}
```

### Send Bulk Emails

```typescript
async sendNewsletterToAllUsers(users: User[]) {
  const recipients = users.map(user => ({
    email: user.email,
    templateData: {
      userName: user.name,
      userId: user.id,
    },
  }));

  const result = await this.emailService.sendBulkEmails(recipients, {
    subject: 'Monthly Newsletter',
    templateId: 'd-newsletter-template-id',
    commonTemplateData: {
      month: 'January',
      year: '2024',
    },
  });

  console.log(`Sent to ${result.successCount}/${result.totalRecipients} users`);

  if (result.failureCount > 0) {
    console.log('Failed emails:', result.failures);
  }
}
```

## Built-in HTML Templates

The module includes fallback HTML templates:

### WELCOME Template
```typescript
await this.emailService.sendWelcomeEmail('user@example.com', 'John Doe');
```

### EMAIL_VERIFICATION Template
```typescript
await this.emailService.sendEmailVerification(
  'user@example.com',
  'John Doe',
  'https://yourapp.com/verify?token=abc123',
  60, // expiry in minutes
);
```

### PASSWORD_RESET Template
```typescript
await this.emailService.sendPasswordReset(
  'user@example.com',
  'John Doe',
  'https://yourapp.com/reset?token=xyz789',
  30, // expiry in minutes
);
```

### Custom HTML Template
```typescript
await this.emailService.sendHTMLTemplateEmail(
  'user@example.com',
  'CUSTOM_TEMPLATE_KEY',
  {
    customField1: 'value1',
    customField2: 'value2',
  },
  'Email Subject',
);
```

## SendGrid Templates

### Creating SendGrid Templates

1. Log in to SendGrid
2. Go to Email API > Dynamic Templates
3. Create a new template
4. Design your template using the drag-and-drop editor
5. Add dynamic content using handlebars: `{{userName}}`, `{{orderNumber}}`, etc.
6. Copy the Template ID (starts with `d-`)

### Using SendGrid Templates

```typescript
// Define your template in src/email/templates/email-templates.ts
export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: {
    id: 'd-your-template-id-here',
    name: 'Order Confirmation',
    description: 'Sent when order is confirmed',
    subject: 'Order Confirmed',
    requiredVariables: ['userName', 'orderNumber', 'totalAmount'],
  },
  // ... more templates
};

// Send using template
await this.emailService.sendTemplateEmail(
  'customer@example.com',
  'ORDER_CONFIRMATION',
  {
    userName: 'John Doe',
    orderNumber: 'ORD-123',
    totalAmount: '$99.99',
    items: [
      { name: 'Product 1', price: '$49.99' },
      { name: 'Product 2', price: '$49.99' },
    ],
  },
);
```

## Development Mode

If `SENDGRID_API_KEY` is not set, the service runs in simulation mode:

- Emails are not actually sent
- Success responses are returned
- Logs show `[SIMULATED] Email would be sent to: ...`
- Perfect for development and testing

## Best Practices

### 1. Email Validation

```typescript
if (!this.emailService.isValidEmail(email)) {
  throw new BadRequestException('Invalid email address');
}
```

### 2. Error Handling

```typescript
const result = await this.emailService.sendEmail({
  to: email,
  subject: 'Test',
  text: 'Test email',
});

if (!result.success) {
  this.logger.error(`Failed to send email: ${result.error}`);
  // Handle the error appropriately
}
```

### 3. Rate Limiting

Consider implementing rate limiting to prevent abuse:

```typescript
@Throttle(10, 60) // 10 requests per 60 seconds
@Post('send')
async sendEmail(@Body() dto: SendEmailDto) {
  // ...
}
```

### 4. Template Variables Validation

Always validate that required template variables are provided:

```typescript
const template = EMAIL_TEMPLATES['ORDER_CONFIRMATION'];
const missingVars = template.requiredVariables.filter(
  varName => !(varName in templateData),
);

if (missingVars.length > 0) {
  throw new BadRequestException(
    `Missing required variables: ${missingVars.join(', ')}`,
  );
}
```

### 5. Batch Processing

For large bulk sends, process in batches:

```typescript
const batchSize = 1000; // SendGrid limit
const batches = this.chunkArray(recipients, batchSize);

for (const batch of batches) {
  await this.emailService.sendBulkEmails(batch, options);
  // Add delay between batches if needed
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

## Common Issues

### Issue: 401 Unauthorized

**Solution:** Check your `SENDGRID_API_KEY` in `.env` file. Ensure the API key has "Mail Send" permissions.

### Issue: Emails not being received

**Possible causes:**
1. Email in spam folder
2. Invalid sender domain (verify your domain in SendGrid)
3. Recipient email doesn't exist
4. SendGrid account suspended or limited

**Solution:**
- Check SendGrid dashboard for delivery stats
- Verify sender domain
- Check spam folder
- Use the test endpoint to verify configuration

### Issue: Template not found

**Solution:** Ensure the template ID in `EMAIL_TEMPLATES` matches the ID in your SendGrid dashboard.

### Issue: Template variables not replaced

**Solution:** Check that variable names in SendGrid template match exactly with the names in `templateData` (case-sensitive).

## Testing

### Test Configuration

```bash
curl -X POST http://localhost:3000/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@example.com"}'
```

### Test Single Email

```bash
curl -X POST http://localhost:3000/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "This is a test email",
    "html": "<h1>Test Email</h1><p>This is a test email</p>"
  }'
```

### Test Welcome Email

```bash
curl -X POST http://localhost:3000/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "userName": "John Doe"
  }'
```

## Production Checklist

- [ ] Verify sender domain in SendGrid
- [ ] Set up proper SPF and DKIM records
- [ ] Configure DMARC policy
- [ ] Add rate limiting to endpoints
- [ ] Implement email queue for high-volume sending
- [ ] Set up monitoring and alerts
- [ ] Configure proper error handling and logging
- [ ] Test all email templates thoroughly
- [ ] Set up bounce and spam report handling
- [ ] Configure unsubscribe links (for marketing emails)
- [ ] Review SendGrid sending limits for your plan
- [ ] Set up backup SMTP provider (optional)

## Advanced Features

### Email Queue (Recommended for Production)

For high-volume email sending, consider implementing a queue:

```typescript
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async queueEmail(options: SendEmailOptions) {
    await this.emailQueue.add('send', options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
```

### Email Analytics

Track email opens and clicks using SendGrid's tracking features:

```typescript
const msg = {
  to: 'user@example.com',
  subject: 'Newsletter',
  html: '<p>Content here</p>',
  trackingSettings: {
    clickTracking: {
      enable: true,
      enableText: true,
    },
    openTracking: {
      enable: true,
    },
  },
};
```

### Custom Categories

Organize emails with custom categories:

```typescript
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Order Confirmation',
  html: '<p>Your order has been confirmed</p>',
  customArgs: {
    category: 'transactional',
    type: 'order-confirmation',
  },
});
```

## Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Node.js Library](https://github.com/sendgrid/sendgrid-nodejs)
- [SendGrid Dynamic Templates](https://docs.sendgrid.com/ui/sending-email/how-to-send-an-email-with-dynamic-transactional-templates)
- [Email Best Practices](https://sendgrid.com/blog/email-best-practices/)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review SendGrid dashboard for delivery stats
3. Check application logs for error messages
4. Verify environment variables are set correctly

## License

This module is part of your NestJS application.
