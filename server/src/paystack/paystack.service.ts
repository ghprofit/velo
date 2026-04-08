import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey: string;
  private readonly apiBase = 'https://api.paystack.co';

  constructor(private config: ConfigService) {
    this.secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY') || '';
    if (!this.secretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY is not configured; Paystack purchase flows will be disabled.');
    } else {
      this.logger.log('✓ Paystack initialized');
    }
  }

  isConfigured(): boolean {
    return !!this.secretKey;
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!this.secretKey) {
      throw new UnauthorizedException('PAYSTACK_SECRET_KEY is not configured');
    }

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString();
    // Paystack signs webhooks with the secret key (no separate webhook secret)
    const hash = crypto.createHmac('sha512', this.secretKey).update(payload).digest('hex');

    this.logger.debug(`Webhook verification — computed: ${hash}, received: ${signature}, bodyLength: ${payload.length}`);

    if (hash.length !== signature.length) {
      this.logger.warn(`Paystack webhook signature length mismatch: computed=${hash.length} header=${signature.length}`);
      return false;
    }

    const isValid = crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));

    if (!isValid) {
      this.logger.warn(`Paystack webhook signature mismatch — computed: ${hash} | received: ${signature}`);
    }

    return isValid;
  }

  private getAuthHeaders() {
    if (!this.secretKey) {
      throw new BadRequestException('Paystack is not configured');
    }
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeTransaction(
    email: string,
    amount: number,
    callbackUrl: string,
    metadata: Record<string, string> = {},
  ): Promise<{ authorizationUrl: string; reference: string }> {
    try {
      const url = `${this.apiBase}/transaction/initialize`;
      const body = {
        email,
        amount: Math.round(amount * 100),
        callback_url: callbackUrl,
        metadata,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const json = (await response.json()) as any;
      if (!response.ok || !json.status) {
        const errorMessage = json.message || 'Failed to initialize Paystack payment';
        this.logger.error(`Paystack initialize error: ${errorMessage}`);
        throw new BadRequestException(errorMessage);
      }

      const { authorization_url, reference } = json.data;
      if (!authorization_url || !reference) {
        this.logger.error('Paystack initialize response missing auth url or reference', json);
        throw new BadRequestException('Failed to initialize Paystack payment');
      }

      return { authorizationUrl: authorization_url, reference };
    } catch (error: any) {
      this.logger.error('Paystack initialize transaction failed:', error?.message || error);
      throw new BadRequestException('Failed to initialize Paystack payment');
    }
  }

  async initializeInlineTransaction(
    email: string,
    amount: number,
    callbackUrl: string,
    metadata: Record<string, string> = {},
    currency: string = 'GHS',
  ): Promise<{ accessCode: string; reference: string }> {
    try {
      const url = `${this.apiBase}/transaction/initialize`;
      const body = {
        email,
        amount: Math.round(amount * 100), // Paystack expects amount in the smallest currency unit
        currency: currency.toUpperCase(),
        callback_url: callbackUrl,
        metadata,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const json = (await response.json()) as any;
      if (!response.ok || !json.status) {
        const errorMessage = json.message || 'Failed to initialize Paystack inline payment';
        this.logger.error(`Paystack inline initialize error: ${errorMessage}`);
        throw new BadRequestException(errorMessage);
      }

      const { access_code, reference } = json.data;
      if (!access_code || !reference) {
        this.logger.error('Paystack inline initialize response missing access code or reference', json);
        throw new BadRequestException('Failed to initialize Paystack inline payment: Missing response data');
      }

      return { accessCode: access_code, reference };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Paystack inline initialize transaction failed:', error?.message || error);
      throw new BadRequestException(`Paystack initialization failed: ${error?.message || 'Connection error'}`);
    }
  }
  async verifyTransaction(
    reference: string,
  ): Promise<{ status: string; amount: number; currency: string; paidAt: string; customerEmail: string }> {
    try {
      const url = `${this.apiBase}/transaction/verify/${encodeURIComponent(reference)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      const json = (await response.json()) as any;

      if (!response.ok || !json.status || !json.data) {
        const errorMessage = json.message || 'Failed to verify Paystack transaction';
        this.logger.error(`Paystack verify error: ${errorMessage}`);
        throw new BadRequestException(errorMessage);
      }

      const data = json.data;
      return {
        status: data.status,
        amount: data.amount / 100,
        currency: data.currency,
        paidAt: data.paid_at || new Date().toISOString(),
        customerEmail: data.customer?.email || '',
      };
    } catch (error: any) {
      this.logger.error('Paystack verify transaction failed:', error?.message || error);
      throw new BadRequestException('Failed to verify Paystack transaction');
    }
  }
}
