import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
export declare class StripeService {
    private config;
    private readonly logger;
    private stripe;
    constructor(config: ConfigService);
    createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>): Promise<Stripe.PaymentIntent>;
    retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent>;
    cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
    createRefund(paymentIntentId: string, amount?: number, reason?: Stripe.RefundCreateParams.Reason): Promise<Stripe.Refund>;
    constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event;
    getPublishableKey(): string;
    createCustomer(email: string, metadata?: Record<string, string>): Promise<Stripe.Customer>;
    getStripeInstance(): Stripe;
}
//# sourceMappingURL=stripe.service.d.ts.map