import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cachedRate: number | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 3600000; // 1 hour in ms

  constructor(private readonly config: ConfigService) {}

  /**
   * Fetches the real-time USD/GHS rate from an external API.
   * Includes a default 3% buffer to protect from market volatility.
   */
  async getUsdToGhsRate(): Promise<number> {
    const now = Date.now();
    
    // Return cached rate if still valid (1 hour)
    if (this.cachedRate && (now - this.lastFetchTime < this.CACHE_TTL)) {
      return this.cachedRate;
    }

    try {
      this.logger.log('[CURRENCY] Fetching fresh USD -> GHS exchange rate...');
      
      // Using exchangerate-api.com (public v4 endpoint)
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
        timeout: 5000,
      });

      const marketRate = response.data?.rates?.GHS;

      if (marketRate && typeof marketRate === 'number') {
        // Add a safety buffer (default 3%)
        const buffer = Number(this.config.get('USD_TO_GHS_BUFFER') || 0.03);
        const finalRate = Number((marketRate * (1 + buffer)).toFixed(2));
        
        this.cachedRate = finalRate;
        this.lastFetchTime = now;
        
        this.logger.log(`[CURRENCY] Rate updated: Market=${marketRate.toFixed(2)}, Final=${finalRate.toFixed(2)} (Buffer: ${buffer * 100}%)`);
        return finalRate;
      }
    } catch (error: any) {
      this.logger.error(`[CURRENCY] API fetch failed: ${error.message}`);
    }

    // Fallback to environment variable or hardcoded default
    const fallbackRate = Number(this.config.get('USD_TO_GHS_RATE') || 14.5);
    this.logger.warn(`[CURRENCY] Using fallback exchange rate: ${fallbackRate}`);
    return fallbackRate;
  }
}
