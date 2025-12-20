export declare class BulkEmailRecipient {
    email: string;
    templateData?: Record<string, any>;
}
export declare class SendBulkEmailDto {
    recipients: BulkEmailRecipient[];
    subject?: string;
    text?: string;
    html?: string;
    templateId?: string;
    commonTemplateData?: Record<string, any>;
    from?: string;
    fromName?: string;
    replyTo?: string;
    customArgs?: Record<string, string>;
}
export declare class SendBulkEmailResponseDto {
    success: boolean;
    totalRecipients: number;
    successCount: number;
    failureCount: number;
    failures?: Array<{
        email: string;
        error: string;
    }>;
    message: string;
    timestamp: Date;
}
//# sourceMappingURL=send-bulk-email.dto.d.ts.map