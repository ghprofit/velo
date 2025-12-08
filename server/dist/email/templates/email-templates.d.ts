import type { EmailTemplate } from '../interfaces/email.interface';
export declare const EMAIL_TEMPLATES: {
    WELCOME: EmailTemplate;
    EMAIL_VERIFICATION: EmailTemplate;
    PASSWORD_RESET: EmailTemplate;
    TWO_FACTOR_ENABLED: EmailTemplate;
    TWO_FACTOR_DISABLED: EmailTemplate;
    ACCOUNT_VERIFIED: EmailTemplate;
    PASSWORD_CHANGED: EmailTemplate;
    SECURITY_ALERT: EmailTemplate;
    NEWSLETTER: EmailTemplate;
    TRANSACTION_RECEIPT: EmailTemplate;
    ACCOUNT_DELETION: EmailTemplate;
    INVITATION: EmailTemplate;
};
export declare const HTML_TEMPLATES: {
    WELCOME: (data: {
        user_name: string;
        app_name: string;
    }) => string;
    EMAIL_VERIFICATION: (data: {
        user_name: string;
        verification_link: string;
        expiry_time: string;
    }) => string;
    PASSWORD_RESET: (data: {
        user_name: string;
        reset_link: string;
        expiry_time: string;
    }) => string;
};
//# sourceMappingURL=email-templates.d.ts.map