import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
export declare class RedisService implements OnModuleDestroy {
    private config;
    private client;
    private readonly logger;
    private isConnected;
    private hasLoggedError;
    constructor(config: ConfigService);
    private initializeClient;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
    exists(key: string): Promise<boolean>;
    ttl(key: string): Promise<number>;
    onModuleDestroy(): Promise<void>;
    isAvailable(): boolean;
    getClient(): Redis;
}
//# sourceMappingURL=redis.service.d.ts.map