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
    createConnectAccount(email: string, metadata?: Record<string, string>): Promise<Stripe.Account>;
    createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<Stripe.AccountLink>;
    getConnectAccount(accountId: string): Promise<Stripe.Account>;
    createTransfer(amount: number, currency: string, destination: string, metadata?: Record<string, string>): Promise<Stripe.Transfer>;
    createPayout(amount: number, currency: string, stripeAccountId: string, metadata?: Record<string, string>): Promise<Stripe.Payout>;
    retrieveTransfer(transferId: string): Promise<Stripe.Transfer>;
    addExternalBankAccount(accountId: string, bankAccountToken: string): Promise<Stripe.BankAccount>;
}
//# sourceMappingURL=stripe.service.d.ts.map