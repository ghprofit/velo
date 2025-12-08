import type { SendEmailOptions, EmailSendResult, BulkEmailResult } from './interfaces/email.interface';
import { EMAIL_TEMPLATES, HTML_TEMPLATES } from './templates/email-templates';
export declare class EmailService {
    private readonly logger;
    private readonly config;
    private isConfigured;
    constructor();
    sendEmail(options: SendEmailOptions): Promise<EmailSendResult>;
    sendTemplateEmail(to: string, templateKey: keyof typeof EMAIL_TEMPLATES, templateData: Record<string, any>, options?: Partial<SendEmailOptions>): Promise<EmailSendResult>;
    sendBulkEmails(recipients: Array<{
        email: string;
        templateData?: Record<string, any>;
    }>, options: Partial<SendEmailOptions>): Promise<BulkEmailResult>;
    sendHTMLTemplateEmail(to: string, templateKey: keyof typeof HTML_TEMPLATES, templateData: Record<string, any>, subject?: string): Promise<EmailSendResult>;
    scheduleEmail(options: SendEmailOptions, sendAt: Date): Promise<EmailSendResult>;
    sendWelcomeEmail(to: string, userName: string): Promise<EmailSendResult>;
    sendEmailVerification(to: string, userName: string, verificationLink: string, expiryMinutes?: number): Promise<EmailSendResult>;
    sendPasswordReset(to: string, userName: string, resetLink: string, expiryMinutes?: number): Promise<EmailSendResult>;
    getEmailStats(days?: number): Promise<any>;
    isValidEmail(email: string): boolean;
    private chunkArray;
    testConfiguration(testEmail: string): Promise<EmailSendResult>;
}
//# sourceMappingURL=email.service.d.ts.map