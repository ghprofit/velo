import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface CreateCheckoutParams {
  reference: string;
  amount: number;
  currency: string;
  email: string;
  description?: string;
  returnUrl: string;
}

export interface VcomCheckoutResponse {
  checkoutUrl: string;
  reference: string;
}

export interface VcomStatusResponse {
  status: string; // 'pending' | 'paid' | 'failed'
  reference: string;
  amount?: number;
  currency?: string;
}

/**
 * Talks to vcom (the Laravel storefront), which hosts a working Paystack
 * integration this platform hands checkout off to instead of talking to
 * Paystack directly.
 */
@Injectable()
export class VcomService {
  private readonly logger = new Logger(VcomService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly webhookSecret: string;

  constructor(private config: ConfigService) {
    this.baseUrl = (this.config.get<string>('VCOM_BASE_URL') || '').replace(/\/$/, '');
    this.apiKey = this.config.get<string>('VCOM_API_KEY') || '';
    this.webhookSecret = this.config.get<string>('VCOM_WEBHOOK_SECRET') || '';

    if (!this.apiKey || !this.baseUrl) {
      this.logger.warn('VCOM_BASE_URL/VCOM_API_KEY not configured; vcom checkout flow will be disabled.');
    } else {
      this.logger.log('vcom checkout initialized');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && !!this.baseUrl;
  }

  private getHeaders() {
    if (!this.isConfigured()) {
      throw new UnauthorizedException('vcom checkout is not configured');
    }

    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async createCheckout(params: CreateCheckoutParams): Promise<VcomCheckoutResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/external-checkout`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          reference: params.reference,
          amount: params.amount,
          currency: params.currency,
          email: params.email,
          description: params.description,
          return_url: params.returnUrl,
          source: 'ghprofit',
        }),
      });

      const rawBody = await response.text();
      let data: any = {};

      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        this.logger.error(
          `vcom checkout returned non-JSON response: status=${response.status} contentType=${response.headers.get('content-type')} body=${rawBody.slice(0, 300)}`,
        );
        throw new BadRequestException('Failed to create vcom checkout');
      }

      if (!response.ok || !data.success) {
        const errorMessage = data?.message || 'Failed to create vcom checkout';
        this.logger.error(`vcom checkout error: status=${response.status} message=${errorMessage}`);
        throw new BadRequestException(errorMessage);
      }

      if (!data.checkout_url) {
        this.logger.error('vcom checkout response missing checkout_url', data);
        throw new BadRequestException('Failed to create vcom checkout');
      }

      return { checkoutUrl: data.checkout_url, reference: data.reference || params.reference };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('vcom checkout request failed:', error?.message || error);
      throw new BadRequestException('Failed to create vcom checkout');
    }
  }

  async checkPaymentStatus(reference: string): Promise<VcomStatusResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/external-checkout/${encodeURIComponent(reference)}/status`,
        { headers: this.getHeaders() },
      );

      const rawBody = await response.text();
      let data: any = {};

      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        this.logger.error(
          `vcom status returned non-JSON response: status=${response.status} contentType=${response.headers.get('content-type')} body=${rawBody.slice(0, 300)}`,
        );
        throw new BadRequestException('Failed to verify vcom payment');
      }

      if (!response.ok || !data.success) {
        const errorMessage = data?.message || 'Failed to verify vcom payment';
        this.logger.error(`vcom status error: status=${response.status} message=${errorMessage}`);
        throw new BadRequestException(errorMessage);
      }

      return {
        status: String(data.status || '').toLowerCase(),
        reference: data.reference || reference,
        amount: data.amount,
        currency: data.currency,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`vcom status request failed for ${reference}:`, error?.message || error);
      throw new BadRequestException('Failed to verify vcom payment');
    }
  }

  isSuccessfulStatus(status: string): boolean {
    return status.toLowerCase() === 'paid';
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string | undefined): boolean {
    if (!this.webhookSecret) {
      throw new UnauthorizedException('VCOM_WEBHOOK_SECRET is not configured');
    }

    if (!signature) {
      return false;
    }

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString();
    const hash = crypto.createHmac('sha256', this.webhookSecret).update(payload).digest('hex');

    if (hash.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  }
}
