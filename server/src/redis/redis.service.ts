import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;
  private hasLoggedError = false;

  constructor(private config: ConfigService) {
    this.initializeClient();
  }

  private async initializeClient() {
    this.client = createClient({
      socket: {
        host: this.config.get('REDIS_HOST') || 'localhost',
        port: parseInt(this.config.get('REDIS_PORT') || '6379'),
        reconnectStrategy: false, // Disable automatic reconnection
      },
      password: this.config.get('REDIS_PASSWORD') || undefined,
      database: parseInt(this.config.get('REDIS_DB') || '0'),
    });

    this.client.on('error', (err) => {
      // Only log the first error to avoid spam
      if (!this.hasLoggedError) {
        this.logger.warn('Redis is unavailable - continuing without caching. Error: ' + err.message);
        this.hasLoggedError = true;
      }
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis Client Connected');
    });

    this.client.on('disconnect', () => {
      this.isConnected = false;
    });

    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      this.isConnected = false;
      this.logger.warn('Redis is unavailable - application will continue without caching');
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
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
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.logger.log('Redis Client Disconnected');
      } catch (error) {
        // Silently ignore disconnection errors
      }
    }
  }

  isAvailable(): boolean {
    return this.isConnected;
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
