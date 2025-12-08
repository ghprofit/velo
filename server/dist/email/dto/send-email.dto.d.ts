export declare class EmailAttachment {
    content: string;
    filename: string;
    type: string;
    disposition?: 'attachment' | 'inline';
    content_id?: string;
}
export declare class SendEmailDto {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
    fromName?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: EmailAttachment[];
    customArgs?: Record<string, string>;
}
export declare class SendEmailResponseDto {
    success: boolean;
    messageId?: string;
    message: string;
    timestamp: Date;
}
//# sourceMappingURL=send-email.dto.d.ts.map