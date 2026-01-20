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
      apiVersion: '2025-11-17.clover' as any,
      timeout: 30000, // Bug #24 fix: 30 seconds timeout
      maxNetworkRetries: 2, // Bug #24 fix: Retry failed requests twice
    });

    this.logger.log('✓ Stripe SDK initialized with 30s timeout and 2 retries');

    // Validate webhook secret at startup (Bug #2)
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      this.logger.error('⚠️  CRITICAL: STRIPE_WEBHOOK_SECRET is not configured!');
      this.logger.error('⚠️  Webhook signature verification will FAIL!');
      this.logger.error('⚠️  This is a SECURITY VULNERABILITY!');
    } else if (!webhookSecret.startsWith('whsec_')) {
      this.logger.warn(
        'STRIPE_WEBHOOK_SECRET format may be invalid (should start with "whsec_")',
      );
    } else {
      this.logger.log('✓ STRIPE_WEBHOOK_SECRET configured correctly');
    }
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

  /**
   * Create a Stripe Connect account for creator payouts
   */
  async createConnectAccount(
    email: string,
    metadata: Record<string, string> = {},
  ): Promise<Stripe.Account> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata,
      });

      this.logger.log(`Connect account created: ${account.id} for ${email}`);
      return account;
    } catch (error: any) {
      this.logger.error('Failed to create Connect account:', error);
      const errorMessage = error?.message || 'Failed to create payout account';
      const errorDetails = error?.raw?.message || error?.message;
      this.logger.error(`Stripe error details: ${errorDetails}`);
      throw new BadRequestException(errorDetails || 'Failed to create payout account');
    }
  }

  /**
   * Create account link for Connect onboarding
   */
  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    try {
      return await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });
    } catch (error) {
      this.logger.error('Failed to create account link:', error);
      throw new BadRequestException('Failed to create account link');
    }
  }

  /**
   * Get Connect account details
   */
  async getConnectAccount(accountId: string): Promise<Stripe.Account> {
    try {
      return await this.stripe.accounts.retrieve(accountId);
    } catch (error) {
      this.logger.error(`Failed to retrieve account ${accountId}:`, error);
      throw new BadRequestException('Failed to retrieve account');
    }
  }

  /**
   * Create a transfer (payout) to a connected account
   */
  async createTransfer(
    amount: number,
    currency: string,
    destination: string,
    metadata: Record<string, string> = {},
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        destination,
        metadata,
      });

      this.logger.log(`Transfer created: ${transfer.id} for ${amount} ${currency} to ${destination}`);
      return transfer;
    } catch (error) {
      this.logger.error('Failed to create transfer:', error);
      throw new BadRequestException('Failed to create transfer');
    }
  }

  /**
   * Create a payout to external bank account
   * Note: Requires Stripe Connect account with external_account setup
   */
  async createPayout(
    amount: number,
    currency: string,
    stripeAccountId: string,
    metadata: Record<string, string> = {},
  ): Promise<Stripe.Payout> {
    try {
      const payout = await this.stripe.payouts.create(
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata,
        },
        {
          stripeAccount: stripeAccountId,
        },
      );

      this.logger.log(`Payout created: ${payout.id} for ${amount} ${currency} on account ${stripeAccountId}`);
      return payout;
    } catch (error) {
      this.logger.error('Failed to create payout:', error);
      throw new BadRequestException('Failed to create payout');
    }
  }

  /**
   * Retrieve transfer details
   */
  async retrieveTransfer(transferId: string): Promise<Stripe.Transfer> {
    try {
      return await this.stripe.transfers.retrieve(transferId);
    } catch (error) {
      this.logger.error(`Failed to retrieve transfer ${transferId}:`, error);
      throw new BadRequestException('Failed to retrieve transfer');
    }
  }

  /**
   * Add external bank account to Connect account
   */
  async addExternalBankAccount(
    accountId: string,
    bankAccountToken: string,
  ): Promise<Stripe.BankAccount> {
    try {
      const bankAccount = await this.stripe.accounts.createExternalAccount(
        accountId,
        {
          external_account: bankAccountToken,
        },
      );

      this.logger.log(`Bank account added to Connect account: ${accountId}`);
      return bankAccount as Stripe.BankAccount;
    } catch (error) {
      this.logger.error('Failed to add bank account:', error);
      throw new BadRequestException('Failed to add bank account');
    }
  }
}
