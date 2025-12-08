import { EmailService } from '../email.service';
export declare class EmailUsageExamples {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendSimpleTextEmail(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendHTMLEmail(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendEmailWithCopies(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendEmailWithAttachment(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendEmailWithInlineImage(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendEmailFromCustomSender(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendEmailWithTracking(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    scheduleEmailForLater(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendWelcomeEmailToNewUser(email: string, userName: string): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendEmailVerificationLink(email: string, userName: string, userId: string): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendPasswordResetLink(email: string, userName: string): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendBulkNewsletterEmails(): Promise<import("../interfaces/email.interface").BulkEmailResult>;
    sendBulkTemplateEmails(): Promise<import("../interfaces/email.interface").BulkEmailResult>;
    sendSendGridTemplateEmail(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendHTMLTemplateEmail(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    handleUserRegistration(email: string, name: string, userId: string): Promise<void>;
    sendOrderConfirmation(order: any): Promise<import("../interfaces/email.interface").EmailSendResult>;
    notifyAdmins(subject: string, message: string, data?: any): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendContactFormSubmission(formData: any): Promise<import("../interfaces/email.interface").EmailSendResult>;
    sendPersonalizedEmailsWithErrorHandling(users: any[]): Promise<{
        successful: string[];
        failed: {
            email: string;
            error: string;
        }[];
    }>;
    sendEmailWithValidation(email: string): Promise<import("../interfaces/email.interface").EmailSendResult>;
    testEmailConfiguration(): Promise<import("../interfaces/email.interface").EmailSendResult>;
    private generateToken;
    private generateInvoicePDF;
    private delay;
}
//# sourceMappingURL=usage.example.d.ts.map