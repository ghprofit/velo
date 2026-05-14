import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CreateCheckoutParams {
  amount: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
  redirectUrl?: string;
  callbackUrl?: string;
  metadata?: Record<string, string>;
}

export interface StrypayCheckoutResponse {
  checkoutUrl: string;
  txRef: string;
  currency: string;
  amount: number;
}

export interface StrypayStatusResponse {
  status: string;
  txRef?: string;
  currency?: string;
  amount?: number;
  raw: any;
}

@Injectable()
export class StrypayService {
  private readonly logger = new Logger(StrypayService.name);
  private readonly apiKey: string;
  private readonly apiBase: string;

  constructor(private config: ConfigService) {
    this.apiKey =
      this.config.get<string>('STRYPAY_API_KEY') ||
      this.config.get<string>('STRYD_API_KEY') ||
      '';
    this.apiBase =
      this.config.get<string>('STRYPAY_BASE_URL') ||
      'https://rcrraujlnlnxlxyyguls.supabase.co/functions/v1';

    if (!this.apiKey) {
      this.logger.warn('STRYPAY_API_KEY is not configured; StrydPay purchase flows will be disabled.');
    } else {
      this.logger.log('StrydPay initialized');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private getHeaders() {
    if (!this.apiKey) {
      throw new UnauthorizedException('STRYPAY_API_KEY is not configured');
    }

    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async createCheckout(params: CreateCheckoutParams): Promise<StrypayCheckoutResponse> {
    try {
      const response = await fetch(`${this.apiBase}/api-checkout`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency,
          customer_name: params.customerName,
          customer_email: params.customerEmail,
          description: params.description,
          redirect_url: params.redirectUrl,
          callback_url: params.callbackUrl,
          metadata: params.metadata,
        }),
      });

      const data = (await response.json()) as any;
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || 'Failed to create StrydPay checkout';
        this.logger.error(`StrydPay checkout error: ${errorMessage}`);
        throw new BadRequestException(errorMessage);
      }

      if (!data.checkout_url || !data.tx_ref) {
        this.logger.error('StrydPay checkout response missing checkout_url or tx_ref', data);
        throw new BadRequestException('Failed to create StrydPay checkout');
      }

      return {
        checkoutUrl: data.checkout_url,
        txRef: data.tx_ref,
        currency: data.currency,
        amount: Number(data.amount),
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('StrydPay checkout request failed:', error?.message || error);
      throw new BadRequestException('Failed to create StrydPay checkout');
    }
  }

  async checkPaymentStatus(txRef: string): Promise<StrypayStatusResponse> {
    try {
      const response = await fetch(
        `${this.apiBase}/api-checkout-status?tx_ref=${encodeURIComponent(txRef)}`,
        { headers: this.getHeaders() },
      );

      const data = (await response.json()) as any;
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || 'Failed to verify StrydPay payment';
        this.logger.error(`StrydPay status error: ${errorMessage}`);
        throw new BadRequestException(errorMessage);
      }

      return {
        status: String(data.status || '').toLowerCase(),
        txRef: data.tx_ref || data.txRef || txRef,
        currency: data.currency,
        amount: typeof data.amount === 'number' ? data.amount : Number(data.amount || 0),
        raw: data,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`StrydPay status request failed for ${txRef}:`, error?.message || error);
      throw new BadRequestException('Failed to verify StrydPay payment');
    }
  }

  isSuccessfulStatus(status: string): boolean {
    return ['successful', 'success', 'completed', 'paid'].includes(status.toLowerCase());
  }
}
