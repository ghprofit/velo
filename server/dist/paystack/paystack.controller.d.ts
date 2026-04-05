import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaystackService } from './paystack.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
export declare class PaystackController {
    private paystackService;
    private prisma;
    private emailService;
    private notificationsService;
    private config;
    private readonly logger;
    constructor(paystackService: PaystackService, prisma: PrismaService, emailService: EmailService, notificationsService: NotificationsService, config: ConfigService);
    test(): {
        ok: boolean;
        message: string;
    };
    handleWebhook(signature: string, request: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
    private handleChargeSuccess;
}
//# sourceMappingURL=paystack.controller.d.ts.map