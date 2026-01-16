import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
export declare class StripeController {
    private stripeService;
    private prisma;
    private emailService;
    private config;
    private readonly logger;
    constructor(stripeService: StripeService, prisma: PrismaService, emailService: EmailService, config: ConfigService);
    getConfig(): {
        publishableKey: string;
    };
    handleWebhook(signature: string, request: RawBodyRequest<Request>): Promise<{
        received: boolean;
    }>;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    private handleChargeRefunded;
}
//# sourceMappingURL=stripe.controller.d.ts.map