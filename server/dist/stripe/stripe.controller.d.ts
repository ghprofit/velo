import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class StripeController {
    private stripeService;
    private prisma;
    private readonly logger;
    constructor(stripeService: StripeService, prisma: PrismaService);
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