"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailUsageExamples = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("../email.service");
let EmailUsageExamples = class EmailUsageExamples {
    constructor(emailService) {
        this.emailService = emailService;
    }
    async sendSimpleTextEmail() {
        const result = await this.emailService.sendEmail({
            to: 'user@example.com',
            subject: 'Simple Text Email',
            text: 'This is a simple text email without HTML formatting.',
        });
        console.log('Email sent:', result.success);
        return result;
    }
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
    async sendEmailWithAttachment() {
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
    async sendEmailWithInlineImage() {
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
    async scheduleEmailForLater() {
        const sendTime = new Date();
        sendTime.setHours(sendTime.getHours() + 24);
        const result = await this.emailService.scheduleEmail({
            to: 'user@example.com',
            subject: 'Scheduled Reminder',
            html: '<h1>This is your scheduled reminder!</h1>',
        }, sendTime);
        console.log('Email scheduled for:', sendTime);
        return result;
    }
    async sendWelcomeEmailToNewUser(email, userName) {
        const result = await this.emailService.sendWelcomeEmail(email, userName);
        return result;
    }
    async sendEmailVerificationLink(email, userName, userId) {
        const verificationToken = this.generateToken();
        const verificationLink = `https://yourapp.com/verify?token=${verificationToken}&userId=${userId}`;
        const result = await this.emailService.sendEmailVerification(email, userName, verificationLink, 60);
        return result;
    }
    async sendPasswordResetLink(email, userName) {
        const resetToken = this.generateToken();
        const resetLink = `https://yourapp.com/reset-password?token=${resetToken}`;
        const result = await this.emailService.sendPasswordReset(email, userName, resetLink, 30);
        return result;
    }
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
    async sendHTMLTemplateEmail() {
        const result = await this.emailService.sendHTMLTemplateEmail('user@example.com', 'WELCOME', {
            user_name: 'John Doe',
            app_name: 'My Awesome App',
        }, 'Welcome to My Awesome App!');
        return result;
    }
    async handleUserRegistration(email, name, userId) {
        await this.emailService.sendWelcomeEmail(email, name);
        const verificationToken = this.generateToken();
        const verificationLink = `https://yourapp.com/verify?token=${verificationToken}`;
        await this.emailService.sendEmailVerification(email, name, verificationLink);
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
    async sendOrderConfirmation(order) {
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
          ${order.items.map((item) => `
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
    async notifyAdmins(subject, message, data) {
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
    async sendContactFormSubmission(formData) {
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
    async sendPersonalizedEmailsWithErrorHandling(users) {
        const results = {
            successful: [],
            failed: [],
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
              ${user.interests.map((interest) => `<li>${interest}</li>`).join('')}
            </ul>
          `,
                    customArgs: {
                        userId: user.id.toString(),
                    },
                });
                if (result.success) {
                    results.successful.push(user.email);
                }
                else {
                    results.failed.push({
                        email: user.email,
                        error: result.error || 'Unknown error',
                    });
                }
            }
            catch (error) {
                results.failed.push({
                    email: user.email,
                    error: error.message,
                });
            }
            await this.delay(100);
        }
        console.log(`Sent to ${results.successful.length} users`);
        console.log(`Failed for ${results.failed.length} users`);
        return results;
    }
    async sendEmailWithValidation(email) {
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
    async testEmailConfiguration() {
        const result = await this.emailService.testConfiguration('your-test@example.com');
        if (result.success) {
            console.log('Email configuration is working correctly!');
        }
        else {
            console.error('Email configuration test failed:', result.error);
        }
        return result;
    }
    generateToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }
    async generateInvoicePDF(order) {
        const content = `Invoice for Order #${order.id}`;
        return Buffer.from(content).toString('base64');
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.EmailUsageExamples = EmailUsageExamples;
exports.EmailUsageExamples = EmailUsageExamples = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], EmailUsageExamples);
//# sourceMappingURL=usage.example.js.map