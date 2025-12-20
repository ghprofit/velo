import { EmailService } from './email.service';
import { SendEmailDto, SendEmailResponseDto, SendTemplateEmailDto, SendBulkEmailDto, SendBulkEmailResponseDto } from './dto';
export declare class EmailController {
    private readonly emailService;
    private readonly logger;
    constructor(emailService: EmailService);
    sendEmail(sendEmailDto: SendEmailDto): Promise<SendEmailResponseDto>;
    sendTemplateEmail(dto: SendTemplateEmailDto): Promise<SendEmailResponseDto>;
    sendBulkEmail(dto: SendBulkEmailDto): Promise<SendBulkEmailResponseDto>;
    sendWelcomeEmail(body: {
        email: string;
        userName: string;
    }): Promise<SendEmailResponseDto>;
    sendEmailVerification(body: {
        email: string;
        userName: string;
        verificationLink: string;
    }): Promise<SendEmailResponseDto>;
    sendPasswordReset(body: {
        email: string;
        userName: string;
        resetLink: string;
    }): Promise<SendEmailResponseDto>;
    testEmail(body: {
        email: string;
    }): Promise<SendEmailResponseDto>;
    getStats(days: string): Promise<any>;
    healthCheck(): {
        status: string;
        service: string;
        provider: string;
        timestamp: string;
    };
}
//# sourceMappingURL=email.controller.d.ts.map