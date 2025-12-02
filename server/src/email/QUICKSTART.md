# Email Service Quick Start Guide

Get started with the Email Service in less than 5 minutes!

## Setup (2 minutes)

### Step 1: Get SendGrid API Key

1. Sign up at [SendGrid](https://sendgrid.com) (free tier available)
2. Go to **Settings > API Keys**
3. Click **Create API Key**
4. Choose **Full Access** or **Mail Send** permissions
5. Copy the API key

### Step 2: Configure Environment

Add to your `.env` file:

```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your App Name
SENDGRID_REPLY_TO_EMAIL=support@yourdomain.com
```

**Note:** Without an API key, the service runs in simulation mode (perfect for development).

### Step 3: Start Your Server

```bash
npm run start:dev
```

## Test the Email Service

### Test Configuration

```bash
curl -X POST http://localhost:3000/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test@example.com"}'
```

If configured correctly, you'll receive a test email!

### Send Your First Email

```bash
curl -X POST http://localhost:3000/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello from NestJS!",
    "html": "<h1>Hello!</h1><p>This is my first email from the Email Service</p>",
    "text": "Hello! This is my first email from the Email Service"
  }'
```

### Send Welcome Email

```bash
curl -X POST http://localhost:3000/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "userName": "John Doe"
  }'
```

### Send Email Verification

```bash
curl -X POST http://localhost:3000/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "userName": "John Doe",
    "verificationLink": "https://yourapp.com/verify?token=abc123"
  }'
```

### Send Password Reset

```bash
curl -X POST http://localhost:3000/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "userName": "John Doe",
    "resetLink": "https://yourapp.com/reset?token=xyz789"
  }'
```

## Using in Your Code

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Injectable()
export class UserService {
  constructor(private readonly emailService: EmailService) {}

  async sendWelcomeEmail(email: string, name: string) {
    await this.emailService.sendWelcomeEmail(email, name);
  }

  async sendCustomEmail(email: string) {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Custom Email',
      html: '<h1>Hello!</h1>',
      text: 'Hello!',
    });
  }
}
```

### Send Email with Attachment

```typescript
async sendInvoice(email: string, pdfBase64: string) {
  await this.emailService.sendEmail({
    to: email,
    subject: 'Your Invoice',
    html: '<p>Please find your invoice attached.</p>',
    attachments: [
      {
        content: pdfBase64,
        filename: 'invoice.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  });
}
```

### Send Bulk Emails

```typescript
async sendBulkNewsletter(users: User[]) {
  const recipients = users.map(user => ({
    email: user.email,
    templateData: {
      userName: user.name,
    },
  }));

  const result = await this.emailService.sendBulkEmails(recipients, {
    subject: 'Monthly Newsletter',
    html: '<h1>Newsletter</h1><p>Hello {{userName}}!</p>',
  });

  console.log(`Sent to ${result.successCount}/${result.totalRecipients}`);
}
```

### Schedule Email

```typescript
async scheduleWelcomeEmail(email: string) {
  const sendTime = new Date();
  sendTime.setHours(sendTime.getHours() + 24); // Send in 24 hours

  await this.emailService.scheduleEmail(
    {
      to: email,
      subject: 'Welcome!',
      html: '<h1>Welcome to our platform!</h1>',
    },
    sendTime,
  );
}
```

## API Endpoints Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/email/send` | POST | Send single email |
| `/email/send-template` | POST | Send using SendGrid template |
| `/email/send-bulk` | POST | Send bulk emails |
| `/email/welcome` | POST | Send welcome email |
| `/email/verify` | POST | Send verification email |
| `/email/password-reset` | POST | Send password reset |
| `/email/test` | POST | Test configuration |
| `/email/stats/:days` | GET | Get email stats |
| `/email/health` | GET | Health check |

## Common Use Cases

### User Registration Flow

```typescript
@Injectable()
export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  async register(email: string, name: string) {
    // 1. Create user in database
    const user = await this.createUser(email, name);

    // 2. Generate verification token
    const token = await this.generateVerificationToken(user.id);

    // 3. Send verification email
    await this.emailService.sendEmailVerification(
      email,
      name,
      `https://yourapp.com/verify?token=${token}`,
      60, // expires in 60 minutes
    );

    // 4. Send welcome email
    await this.emailService.sendWelcomeEmail(email, name);
  }
}
```

### Password Reset Flow

```typescript
async requestPasswordReset(email: string) {
  const user = await this.findUserByEmail(email);
  if (!user) return; // Don't reveal if user exists

  const token = await this.generateResetToken(user.id);

  await this.emailService.sendPasswordReset(
    email,
    user.name,
    `https://yourapp.com/reset-password?token=${token}`,
    30, // expires in 30 minutes
  );
}
```

### Order Confirmation

```typescript
async sendOrderConfirmation(order: Order) {
  await this.emailService.sendEmail({
    to: order.customerEmail,
    subject: `Order Confirmation #${order.id}`,
    html: `
      <h1>Order Confirmed!</h1>
      <p>Thank you for your order, ${order.customerName}!</p>
      <h2>Order Details:</h2>
      <p>Order Number: ${order.id}</p>
      <p>Total: $${order.total}</p>
    `,
  });
}
```

### Notification System

```typescript
async notifyAdmins(subject: string, message: string) {
  const adminEmails = await this.getAdminEmails();

  await this.emailService.sendEmail({
    to: adminEmails[0],
    bcc: adminEmails.slice(1), // Other admins as BCC
    subject: `[Admin] ${subject}`,
    html: `<p>${message}</p>`,
  });
}
```

## SendGrid Templates (Advanced)

### Step 1: Create Template in SendGrid

1. Log in to SendGrid
2. Go to **Email API > Dynamic Templates**
3. Click **Create Template**
4. Design your template
5. Use handlebars for dynamic content: `{{userName}}`, `{{orderNumber}}`
6. Copy the Template ID (starts with `d-`)

### Step 2: Add Template to Code

Edit `src/email/templates/email-templates.ts`:

```typescript
export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: {
    id: 'd-your-template-id-here',
    name: 'Order Confirmation',
    description: 'Sent when order is confirmed',
    subject: 'Order Confirmed',
    requiredVariables: ['userName', 'orderNumber', 'totalAmount'],
  },
};
```

### Step 3: Use Template

```typescript
await this.emailService.sendTemplateEmail(
  'customer@example.com',
  'ORDER_CONFIRMATION',
  {
    userName: 'John Doe',
    orderNumber: 'ORD-123',
    totalAmount: '$99.99',
  },
);
```

Or use REST endpoint:

```bash
curl -X POST http://localhost:3000/email/send-template \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "templateId": "d-your-template-id",
    "templateData": {
      "userName": "John Doe",
      "orderNumber": "ORD-123",
      "totalAmount": "$99.99"
    }
  }'
```

## Development Mode

If no `SENDGRID_API_KEY` is set:

- Emails are **simulated** (not actually sent)
- Logs show: `[SIMULATED] Email would be sent to: user@example.com`
- Success responses are returned
- Perfect for development and testing

To enable simulation mode, simply remove or comment out `SENDGRID_API_KEY` in `.env`.

## Troubleshooting

### Emails not received?

1. **Check spam folder** - New senders often land in spam
2. **Verify API key** - Ensure it has "Mail Send" permissions
3. **Check SendGrid dashboard** - View delivery stats and errors
4. **Verify sender domain** - Unverified domains may be blocked
5. **Check logs** - Look for error messages in console

### 401 Unauthorized?

- Double-check `SENDGRID_API_KEY` in `.env`
- Ensure no extra spaces or quotes
- Verify the API key is still active in SendGrid

### Template variables not replaced?

- Check variable names match exactly (case-sensitive)
- Verify template ID is correct
- Ensure `templateData` contains all required variables

## Next Steps

1. **Customize templates** - Edit HTML templates in `src/email/templates/`
2. **Add your templates** - Create SendGrid templates for your use cases
3. **Implement email queue** - For high-volume sending (use Bull/Redis)
4. **Add rate limiting** - Prevent abuse with `@nestjs/throttler`
5. **Monitor delivery** - Set up SendGrid webhooks for events
6. **Verify domain** - Improve deliverability with domain authentication

See [README.md](README.md) for complete documentation.

## Example Integration

Here's a complete example integrating email service with user authentication:

```typescript
// auth.service.ts
import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  async register(registerDto: RegisterDto) {
    // Create user
    const user = await this.usersService.create(registerDto);

    // Generate verification token
    const verificationToken = this.generateToken();
    await this.saveVerificationToken(user.id, verificationToken);

    // Send verification email
    const verificationLink = `${process.env.APP_URL}/auth/verify?token=${verificationToken}`;
    await this.emailService.sendEmailVerification(
      user.email,
      user.name,
      verificationLink,
    );

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return { message: 'Registration successful. Please check your email.' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = this.generateToken();
    await this.saveResetToken(user.id, resetToken);

    // Send reset email
    const resetLink = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordReset(
      user.email,
      user.name,
      resetLink,
    );

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  private generateToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}
```

Happy emailing!
