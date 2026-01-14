import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;
  private hasLoggedError = false;

  constructor(private config: ConfigService) {
    this.initializeClient();
  }

  private initializeClient() {
    const restUrl = this.config.get('UPSTASH_REDIS_REST_URL');
    const restToken = this.config.get('UPSTASH_REDIS_REST_TOKEN');

    if (!restUrl || !restToken) {
      this.logger.warn('Upstash Redis REST credentials not configured - continuing without caching');
      this.isConnected = false;
      return;
    }

    try {
      this.client = new Redis({
        url: restUrl,
        token: restToken,
      });

      this.isConnected = true;
      this.logger.log('Upstash Redis REST client initialized');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn('Failed to initialize Upstash Redis client - continuing without caching');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      if (!this.hasLoggedError) {
        this.logger.warn('Redis operation failed:', error);
        this.hasLoggedError = true;
      }
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      // Silently fail if Redis is unavailable
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      // Silently fail if Redis is unavailable
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isConnected) return 0;
    try {
      return await this.client.incr(key);
    } catch (error) {
      return 0;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      // Silently fail if Redis is unavailable
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isConnected) return -1;
    try {
      return await this.client.ttl(key);
    } catch (error) {
      return -1;
    }
  }

  async onModuleDestroy() {
    // No cleanup needed for REST client
    this.logger.log('Redis service destroyed');
  }

  isAvailable(): boolean {
    return this.isConnected;
  }

  getClient(): Redis {
    return this.client;
  }
}
