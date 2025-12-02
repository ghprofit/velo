/**
 * Email Service Usage Examples
 *
 * This file contains practical examples of how to use the EmailService
 * in various scenarios throughout your application.
 */

import { Injectable } from '@nestjs/common';
import { EmailService } from '../email.service';

@Injectable()
export class EmailUsageExamples {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Example 1: Send a simple text email
   */
  async sendSimpleTextEmail() {
    const result = await this.emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Simple Text Email',
      text: 'This is a simple text email without HTML formatting.',
    });

    console.log('Email sent:', result.success);
    return result;
  }

  /**
   * Example 2: Send an HTML email
   */
  async sendHTMLEmail() {
    const result = await this.emailService.sendEmail({
      to: 'user@example.com',
      subject: 'HTML Email',
      html: `
        <html>
          <body>
            <h1>Welcome!</h1>
            <p>This is an HTML email with <strong>formatting</strong>.</p>
            <a href="https://example.com">Click here</a>
          </body>
        </html>
      `,
      text: 'Welcome! This is an HTML email with formatting. Click here: https://example.com',
    });

    return result;
  }

  /**
   * Example 3: Send email with CC and BCC
   */
  async sendEmailWithCopies() {
    const result = await this.emailService.sendEmail({
      to: 'primary@example.com',
      cc: ['manager@example.com', 'team@example.com'],
      bcc: ['audit@example.com'],
      subject: 'Important Update',
      html: '<h1>Important Update</h1><p>Please review this information.</p>',
    });

    return result;
  }

  /**
   * Example 4: Send email with attachment
   */
  async sendEmailWithAttachment() {
    // Simulate PDF content (in real app, you'd read from file or generate)
    const pdfContent = Buffer.from('PDF content here').toString('base64');

    const result = await this.emailService.sendEmail({
      to: 'customer@example.com',
      subject: 'Your Invoice',
      html: '<h1>Invoice</h1><p>Please find your invoice attached.</p>',
      attachments: [
        {
          content: pdfContent,
          filename: 'invoice-2024-01.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    });

    return result;
  }

  /**
   * Example 5: Send email with inline image
   */
  async sendEmailWithInlineImage() {
    // Base64 encoded image
    const imageContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await this.emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Email with Image',
      html: `
        <h1>Email with Inline Image</h1>
        <img src="cid:company-logo" alt="Company Logo" />
        <p>This email contains an inline image.</p>
      `,
      attachments: [
        {
          content: imageContent,
          filename: 'logo.png',
          type: 'image/png',
          disposition: 'inline',
          content_id: 'company-logo',
        },
      ],
    });

    return result;
  }

  /**
   * Example 6: Send custom email from different sender
   */
  async sendEmailFromCustomSender() {
    const result = await this.emailService.sendEmail({
      to: 'customer@example.com',
      from: 'sales@example.com',
      fromName: 'Sales Team',
      replyTo: 'sales-support@example.com',
      subject: 'Special Offer',
      html: '<h1>Exclusive Offer Just for You!</h1>',
    });

    return result;
  }

  /**
   * Example 7: Send email with custom tracking arguments
   */
  async sendEmailWithTracking() {
    const result = await this.emailService.sendEmail({
      to: 'user@example.com',
      subject: 'Campaign Email',
      html: '<h1>Check out our new features!</h1>',
      customArgs: {
        campaignId: 'spring-2024',
        userId: '12345',
        source: 'newsletter',
        segmentId: 'premium-users',
      },
    });

    return result;
  }

  /**
   * Example 8: Schedule email for later
   */
  async scheduleEmailForLater() {
    const sendTime = new Date();
    sendTime.setHours(sendTime.getHours() + 24); // Send in 24 hours

    const result = await this.emailService.scheduleEmail(
      {
        to: 'user@example.com',
        subject: 'Scheduled Reminder',
        html: '<h1>This is your scheduled reminder!</h1>',
      },
      sendTime,
    );

    console.log('Email scheduled for:', sendTime);
    return result;
  }

  /**
   * Example 9: Send welcome email (using built-in template)
   */
  async sendWelcomeEmailToNewUser(email: string, userName: string) {
    const result = await this.emailService.sendWelcomeEmail(email, userName);
    return result;
  }

  /**
   * Example 10: Send email verification
   */
  async sendEmailVerificationLink(email: string, userName: string, userId: string) {
    // Generate verification token (in real app, save this to database)
    const verificationToken = this.generateToken();
    const verificationLink = `https://yourapp.com/verify?token=${verificationToken}&userId=${userId}`;

    const result = await this.emailService.sendEmailVerification(
      email,
      userName,
      verificationLink,
      60, // expires in 60 minutes
    );

    return result;
  }

  /**
   * Example 11: Send password reset email
   */
  async sendPasswordResetLink(email: string, userName: string) {
    // Generate reset token (in real app, save this to database)
    const resetToken = this.generateToken();
    const resetLink = `https://yourapp.com/reset-password?token=${resetToken}`;

    const result = await this.emailService.sendPasswordReset(
      email,
      userName,
      resetLink,
      30, // expires in 30 minutes
    );

    return result;
  }

  /**
   * Example 12: Send bulk emails to multiple recipients
   */
  async sendBulkNewsletterEmails() {
    const recipients = [
      {
        email: 'user1@example.com',
        templateData: {
          userName: 'John Doe',
          subscriptionType: 'Premium',
        },
      },
      {
        email: 'user2@example.com',
        templateData: {
          userName: 'Jane Smith',
          subscriptionType: 'Free',
        },
      },
      {
        email: 'user3@example.com',
        templateData: {
          userName: 'Bob Johnson',
          subscriptionType: 'Premium',
        },
      },
    ];

    const result = await this.emailService.sendBulkEmails(recipients, {
      subject: 'Monthly Newsletter - January 2024',
      html: `
        <h1>Hello {{userName}}!</h1>
        <p>Welcome to our monthly newsletter.</p>
        <p>Your subscription: {{subscriptionType}}</p>
      `,
      customArgs: {
        campaign: 'newsletter-jan-2024',
      },
    });

    console.log(`Sent to ${result.successCount}/${result.totalRecipients} recipients`);
    console.log('Failures:', result.failures);

    return result;
  }

  /**
   * Example 13: Send bulk emails using SendGrid template
   */
  async sendBulkTemplateEmails() {
    const recipients = [
      {
        email: 'customer1@example.com',
        templateData: {
          orderNumber: 'ORD-001',
          totalAmount: '$99.99',
          customerName: 'John Doe',
        },
      },
      {
        email: 'customer2@example.com',
        templateData: {
          orderNumber: 'ORD-002',
          totalAmount: '$149.99',
          customerName: 'Jane Smith',
        },
      },
    ];

    const result = await this.emailService.sendBulkEmails(recipients, {
      templateId: 'd-your-sendgrid-template-id',
      templateData: {
        companyName: 'ACME Corp',
        year: '2024',
        supportEmail: 'support@acme.com',
      },
    });

    return result;
  }

  /**
   * Example 14: Send email using SendGrid template
   */
  async sendSendGridTemplateEmail() {
    const result = await this.emailService.sendEmail({
      to: 'customer@example.com',
      templateId: 'd-your-sendgrid-template-id',
      templateData: {
        userName: 'John Doe',
        orderNumber: 'ORD-12345',
        orderDate: '2024-01-15',
        totalAmount: '$99.99',
        items: [
          { name: 'Product 1', quantity: 2, price: '$49.99' },
          { name: 'Product 2', quantity: 1, price: '$49.99' },
        ],
      },
    });

    return result;
  }

  /**
   * Example 15: Send HTML template email (fallback)
   */
  async sendHTMLTemplateEmail() {
    const result = await this.emailService.sendHTMLTemplateEmail(
      'user@example.com',
      'WELCOME',
      {
        user_name: 'John Doe',
        app_name: 'My Awesome App',
      },
      'Welcome to My Awesome App!',
    );

    return result;
  }

  /**
   * Example 16: Complete user registration flow
   */
  async handleUserRegistration(email: string, name: string, userId: string) {
    // Send welcome email
    await this.emailService.sendWelcomeEmail(email, name);

    // Send verification email
    const verificationToken = this.generateToken();
    const verificationLink = `https://yourapp.com/verify?token=${verificationToken}`;
    await this.emailService.sendEmailVerification(email, name, verificationLink);

    // Send onboarding email
    await this.emailService.sendEmail({
      to: email,
      subject: 'Get Started with Your New Account',
      html: `
        <h1>Welcome, ${name}!</h1>
        <h2>Here's how to get started:</h2>
        <ol>
          <li>Complete your profile</li>
          <li>Explore our features</li>
          <li>Connect with others</li>
        </ol>
        <a href="https://yourapp.com/dashboard">Go to Dashboard</a>
      `,
    });

    console.log('Registration emails sent successfully');
  }

  /**
   * Example 17: Send order confirmation with invoice
   */
  async sendOrderConfirmation(order: any) {
    // Generate invoice PDF (pseudo-code)
    const invoicePdf = await this.generateInvoicePDF(order);

    const result = await this.emailService.sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation - Order #${order.id}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Hi ${order.customerName},</p>
        <p>Your order #${order.id} has been confirmed.</p>

        <h2>Order Summary:</h2>
        <table>
          <tr><th>Item</th><th>Quantity</th><th>Price</th></tr>
          ${order.items.map((item: any) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>$${item.price}</td>
            </tr>
          `).join('')}
        </table>

        <p><strong>Total: $${order.total}</strong></p>

        <p>Your invoice is attached.</p>
      `,
      attachments: [
        {
          content: invoicePdf,
          filename: `invoice-${order.id}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
      customArgs: {
        orderId: order.id.toString(),
        orderType: 'ecommerce',
      },
    });

    return result;
  }

  /**
   * Example 18: Send notification to admins
   */
  async notifyAdmins(subject: string, message: string, data?: any) {
    const adminEmails = ['admin1@example.com', 'admin2@example.com'];

    const result = await this.emailService.sendEmail({
      to: adminEmails[0],
      bcc: adminEmails.slice(1),
      subject: `[Admin Notification] ${subject}`,
      html: `
        <h1>Admin Notification</h1>
        <p>${message}</p>
        ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''}
      `,
    });

    return result;
  }

  /**
   * Example 19: Send feedback/contact form submission
   */
  async sendContactFormSubmission(formData: any) {
    const result = await this.emailService.sendEmail({
      to: 'support@example.com',
      replyTo: formData.email,
      subject: `Contact Form: ${formData.subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message}</p>
      `,
    });

    // Send auto-reply to user
    await this.emailService.sendEmail({
      to: formData.email,
      subject: 'We received your message',
      html: `
        <h1>Thank you for contacting us!</h1>
        <p>Hi ${formData.name},</p>
        <p>We've received your message and will get back to you within 24 hours.</p>
        <p>Your message:</p>
        <p><em>${formData.message}</em></p>
      `,
    });

    return result;
  }

  /**
   * Example 20: Send batch of personalized emails with error handling
   */
  async sendPersonalizedEmailsWithErrorHandling(users: any[]) {
    const results = {
      successful: [] as string[],
      failed: [] as { email: string; error: string }[],
    };

    for (const user of users) {
      try {
        const result = await this.emailService.sendEmail({
          to: user.email,
          subject: `Personalized Update for ${user.name}`,
          html: `
            <h1>Hi ${user.name}!</h1>
            <p>Here's your personalized update based on your preferences:</p>
            <ul>
              ${user.interests.map((interest: string) => `<li>${interest}</li>`).join('')}
            </ul>
          `,
          customArgs: {
            userId: user.id.toString(),
          },
        });

        if (result.success) {
          results.successful.push(user.email);
        } else {
          results.failed.push({
            email: user.email,
            error: result.error || 'Unknown error',
          });
        }
      } catch (error) {
        results.failed.push({
          email: user.email,
          error: error.message,
        });
      }

      // Add delay to avoid rate limiting
      await this.delay(100);
    }

    console.log(`Sent to ${results.successful.length} users`);
    console.log(`Failed for ${results.failed.length} users`);

    return results;
  }

  /**
   * Example 21: Validate email before sending
   */
  async sendEmailWithValidation(email: string) {
    if (!this.emailService.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }

    const result = await this.emailService.sendEmail({
      to: email,
      subject: 'Validated Email',
      text: 'This email was validated before sending.',
    });

    return result;
  }

  /**
   * Example 22: Test email configuration
   */
  async testEmailConfiguration() {
    const result = await this.emailService.testConfiguration('your-test@example.com');

    if (result.success) {
      console.log('Email configuration is working correctly!');
    } else {
      console.error('Email configuration test failed:', result.error);
    }

    return result;
  }

  /**
   * Helper: Generate random token
   */
  private generateToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Helper: Generate invoice PDF (placeholder)
   */
  private async generateInvoicePDF(order: any): Promise<string> {
    // This is a placeholder - implement actual PDF generation
    const content = `Invoice for Order #${order.id}`;
    return Buffer.from(content).toString('base64');
  }

  /**
   * Helper: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Example usage in a controller:
 */

/*
import { Controller, Post, Body } from '@nestjs/common';
import { EmailUsageExamples } from './email/examples/usage.example';

@Controller('examples')
export class ExamplesController {
  constructor(private readonly examples: EmailUsageExamples) {}

  @Post('send-simple')
  async sendSimple() {
    return this.examples.sendSimpleTextEmail();
  }

  @Post('send-html')
  async sendHTML() {
    return this.examples.sendHTMLEmail();
  }

  @Post('register')
  async register(@Body() body: { email: string; name: string; userId: string }) {
    return this.examples.handleUserRegistration(body.email, body.name, body.userId);
  }

  @Post('test')
  async test() {
    return this.examples.testEmailConfiguration();
  }
}
*/
