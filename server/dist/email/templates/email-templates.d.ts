import type { EmailTemplate } from '../interfaces/email.interface';
export declare const SENDGRID_TEMPLATE_ID: string;
export declare const EMAIL_TEMPLATES: {
    WELCOME: EmailTemplate;
    EMAIL_VERIFICATION: EmailTemplate;
    PASSWORD_RESET: EmailTemplate;
    TWO_FACTOR_ENABLED: EmailTemplate;
    TWO_FACTOR_DISABLED: EmailTemplate;
    ACCOUNT_VERIFIED: EmailTemplate;
    PASSWORD_CHANGED: EmailTemplate;
    SECURITY_ALERT: EmailTemplate;
    PURCHASE_RECEIPT: EmailTemplate;
    CREATOR_SALE_NOTIFICATION: EmailTemplate;
    PAYOUT_PROCESSED: EmailTemplate;
    ADMIN_PAYOUT_REQUEST_ALERT: EmailTemplate;
    PAYOUT_APPROVED: EmailTemplate;
    PAYOUT_REJECTED: EmailTemplate;
    CONTENT_APPROVED: EmailTemplate;
    CONTENT_REJECTED: EmailTemplate;
    ACCOUNT_DELETION: EmailTemplate;
    NEWSLETTER: EmailTemplate;
    SUPPORT_TICKET_RECEIVED: EmailTemplate;
    SUPPORT_TICKET_REPLY: EmailTemplate;
};
export declare const HTML_TEMPLATES: {
    WELCOME: (data: {
        user_name: string;
    }) => string;
    WELCOME_CREATOR_WAITLIST: (data: {
        user_name: string;
    }) => string;
    WELCOME_CREATOR: (data: {
        user_name: string;
    }) => string;
    EMAIL_VERIFICATION: (data: {
        user_name: string;
        verification_code: string;
        expiry_time: string;
    }) => string;
    PASSWORD_RESET: (data: {
        user_name: string;
        reset_link: string;
        expiry_time: string;
    }) => string;
    TWO_FACTOR_ENABLED: (data: {
        user_name: string;
        enabled_date: string;
        ip_address: string;
    }) => string;
    TWO_FACTOR_DISABLED: (data: {
        user_name: string;
        disabled_date: string;
        ip_address: string;
    }) => string;
    ACCOUNT_VERIFIED: (data: {
        user_name: string;
        verification_date: string;
    }) => string;
    PASSWORD_CHANGED: (data: {
        user_name: string;
        change_date: string;
        ip_address: string;
    }) => string;
    SECURITY_ALERT: (data: {
        user_name: string;
        activity_description: string;
        activity_date: string;
        ip_address: string;
    }) => string;
    PURCHASE_RECEIPT: (data: {
        buyer_email: string;
        content_title: string;
        amount: string;
        date: string;
        access_link: string;
        transaction_id?: string;
    }) => string;
    CREATOR_SALE_NOTIFICATION: (data: {
        creator_name: string;
        content_title: string;
        amount: string;
        date: string;
    }) => string;
    PAYOUT_PROCESSED: (data: {
        creator_name: string;
        amount: string;
        payout_date: string;
        transaction_id: string;
    }) => string;
    ADMIN_PAYOUT_REQUEST_ALERT: (data: {
        creator_name: string;
        amount: string;
        request_id: string;
        available_balance: string;
    }) => string;
    PAYOUT_APPROVED: (data: {
        creator_name: string;
        amount: string;
        request_id: string;
    }) => string;
    PAYOUT_REJECTED: (data: {
        creator_name: string;
        amount: string;
        reason: string;
    }) => string;
    CONTENT_APPROVED: (data: {
        creator_name: string;
        content_title: string;
        content_link: string;
    }) => string;
    CONTENT_REJECTED: (data: {
        creator_name: string;
        content_title: string;
        rejection_reason: string;
    }) => string;
    ACCOUNT_DELETION: (data: {
        user_name: string;
        deletion_date: string;
    }) => string;
    NEWSLETTER: (data: {
        user_name: string;
        newsletter_content: string;
    }) => string;
    SUPPORT_TICKET_RECEIVED: (data: {
        user_name: string;
        ticket_id: string;
        subject: string;
    }) => string;
    SUPPORT_TICKET_REPLY: (data: {
        user_name: string;
        ticket_id: string;
        reply_message: string;
    }) => string;
};
//# sourceMappingURL=email-templates.d.ts.map