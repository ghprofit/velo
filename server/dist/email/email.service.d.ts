import type { SendEmailOptions, EmailSendResult, BulkEmailResult } from './interfaces/email.interface';
import { HTML_TEMPLATES } from './templates/email-templates';
export declare class EmailService {
    private readonly logger;
    private readonly config;
    private readonly transporter;
    private isConfigured;
    constructor();
    sendEmail(options: SendEmailOptions): Promise<EmailSendResult>;
    sendBulkEmails(recipients: Array<{
        email: string;
        templateData?: Record<string, any>;
    }>, options: Partial<SendEmailOptions>): Promise<BulkEmailResult>;
    sendHTMLTemplateEmail(to: string, templateKey: keyof typeof HTML_TEMPLATES, templateData: Record<string, any>, subject?: string): Promise<EmailSendResult>;
    scheduleEmail(options: SendEmailOptions, sendAt: Date): Promise<EmailSendResult>;
    sendWelcomeEmail(to: string, userName: string): Promise<EmailSendResult>;
    sendCreatorWelcomeEmail(to: string, creatorName: string, hasWaitlistBonus?: boolean, bonusAmount?: number): Promise<EmailSendResult>;
    sendEmailVerification(to: string, userName: string, verificationCode: string, expiryMinutes?: number): Promise<EmailSendResult>;
    sendPasswordReset(to: string, userName: string, resetLink: string, expiryMinutes?: number): Promise<EmailSendResult>;
    getEmailStats(days?: number): Promise<any>;
    isValidEmail(email: string): boolean;
    testConfiguration(testEmail: string): Promise<EmailSendResult>;
    sendPurchaseReceipt(to: string, data: {
        buyer_email: string;
        content_title: string;
        amount: string;
        date: string;
        access_link: string;
        transaction_id?: string;
    }): Promise<EmailSendResult>;
    sendCreatorSaleNotification(to: string, data: {
        creator_name: string;
        content_title: string;
        amount: string;
        date: string;
    }): Promise<EmailSendResult>;
    sendPayoutProcessed(to: string, data: {
        creator_name: string;
        amount: string;
        payout_date: string;
        transaction_id: string;
    }): Promise<EmailSendResult>;
    sendAdminPayoutAlert(to: string, data: {
        creator_name: string;
        amount: string;
        request_id: string;
        available_balance: string;
    }): Promise<EmailSendResult>;
    sendPayoutApproved(to: string, data: {
        creator_name: string;
        amount: string;
        request_id: string;
    }): Promise<EmailSendResult>;
    sendPayoutRejected(to: string, data: {
        creator_name: string;
        amount: string;
        reason: string;
    }): Promise<EmailSendResult>;
    sendContentApproved(to: string, data: {
        creator_name: string;
        content_title: string;
        content_link: string;
    }): Promise<EmailSendResult>;
    sendContentRejected(to: string, data: {
        creator_name: string;
        content_title: string;
        rejection_reason: string;
    }): Promise<EmailSendResult>;
    send2FAEnabled(to: string, userName: string, ipAddress: string): Promise<EmailSendResult>;
    send2FADisabled(to: string, userName: string, ipAddress: string): Promise<EmailSendResult>;
    sendAccountVerified(to: string, userName: string): Promise<EmailSendResult>;
    sendPasswordChanged(to: string, userName: string, ipAddress: string): Promise<EmailSendResult>;
    sendSecurityAlert(to: string, userName: string, activityDescription: string, ipAddress: string): Promise<EmailSendResult>;
    sendSupportTicketReceived(to: string, userName: string, ticketId: string, subject: string): Promise<EmailSendResult>;
    sendSupportTicketReply(to: string, userName: string, ticketId: string, replyMessage: string): Promise<EmailSendResult>;
    sendAccountDeletion(to: string, userName: string, deletionDate: string): Promise<EmailSendResult>;
    sendNewsletter(to: string, userName: string, newsletterContent: string): Promise<EmailSendResult>;
    sendContentApproval(to: string, creatorName: string, contentTitle: string, contentLink: string): Promise<EmailSendResult>;
    sendContentRejection(to: string, creatorName: string, contentTitle: string, rejectionReason: string): Promise<EmailSendResult>;
}
//# sourceMappingURL=email.service.d.ts.map