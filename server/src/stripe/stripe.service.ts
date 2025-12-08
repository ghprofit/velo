import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(private config: ConfigService) {
    const stripeSecretKey = this.config.get<string>('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not configured');
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    this.logger.log('Stripe service initialized');
  }

  /**
   * Create a payment intent for content purchase
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {},
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create payment intent:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  /**
   * Retrieve a payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent ${paymentIntentId}:`, error);
      throw new BadRequestException('Failed to retrieve payment intent');
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentConfirmParams = {};
      if (paymentMethodId) {
        params.payment_method = paymentMethodId;
      }

      return await this.stripe.paymentIntents.confirm(paymentIntentId, params);
    } catch (error) {
      this.logger.error(`Failed to confirm payment intent ${paymentIntentId}:`, error);
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      this.logger.error(`Failed to cancel payment intent ${paymentIntentId}:`, error);
      throw new BadRequestException('Failed to cancel payment');
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason,
  ): Promise<Stripe.Refund> {
    try {
      const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        params.amount = Math.round(amount * 100);
      }

      if (reason) {
        params.reason = reason;
      }

      const refund = await this.stripe.refunds.create(params);
      this.logger.log(`Refund created: ${refund.id} for payment intent ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to create refund for ${paymentIntentId}:`, error);
      throw new BadRequestException('Failed to create refund');
    }
  }

  /**
   * Construct webhook event from raw body and signature
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.error('STRIPE_WEBHOOK_SECRET is not configured');
      throw new Error('STRIPE_WEBHOOK_SECRET is required');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Get publishable key (for frontend)
   */
  getPublishableKey(): string {
    const publishableKey = this.config.get<string>('STRIPE_PUBLISHABLE_KEY');

    if (!publishableKey) {
      this.logger.error('STRIPE_PUBLISHABLE_KEY is not configured');
      throw new Error('STRIPE_PUBLISHABLE_KEY is required');
    }

    return publishableKey;
  }

  /**
   * Create a customer (optional - for future use)
   */
  async createCustomer(
    email: string,
    metadata: Record<string, string> = {},
  ): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        metadata,
      });
    } catch (error) {
      this.logger.error('Failed to create customer:', error);
      throw new BadRequestException('Failed to create customer');
    }
  }

  /**
   * Get Stripe instance (for advanced use cases)
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
