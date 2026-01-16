"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_1 = require("@upstash/redis");
let RedisService = RedisService_1 = class RedisService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.isConnected = false;
        this.hasLoggedError = false;
        this.initializeClient();
    }
    initializeClient() {
        const restUrl = this.config.get('UPSTASH_REDIS_REST_URL');
        const restToken = this.config.get('UPSTASH_REDIS_REST_TOKEN');
        if (!restUrl || !restToken) {
            this.logger.warn('Upstash Redis REST credentials not configured - continuing without caching');
            this.isConnected = false;
            return;
        }
        try {
            this.client = new redis_1.Redis({
                url: restUrl,
                token: restToken,
            });
            this.isConnected = true;
            this.logger.log('Upstash Redis REST client initialized');
        }
        catch (error) {
            this.isConnected = false;
            this.logger.warn('Failed to initialize Upstash Redis client - continuing without caching');
        }
    }
    async get(key) {
        if (!this.isConnected)
            return null;
        try {
            return await this.client.get(key);
        }
        catch (error) {
            if (!this.hasLoggedError) {
                this.logger.warn('Redis operation failed:', error);
                this.hasLoggedError = true;
            }
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.isConnected)
            return;
        try {
            if (ttl) {
                await this.client.setex(key, ttl, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
        }
    }
    async del(key) {
        if (!this.isConnected)
            return;
        try {
            await this.client.del(key);
        }
        catch (error) {
        }
    }
    async incr(key) {
        if (!this.isConnected)
            return 0;
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            return 0;
        }
    }
    async expire(key, seconds) {
        if (!this.isConnected)
            return;
        try {
            await this.client.expire(key, seconds);
        }
        catch (error) {
        }
    }
    async exists(key) {
        if (!this.isConnected)
            return false;
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            return false;
        }
    }
    async ttl(key) {
        if (!this.isConnected)
            return -1;
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            return -1;
        }
    }
    async onModuleDestroy() {
        this.logger.log('Redis service destroyed');
    }
    isAvailable() {
        return this.isConnected;
    }
    getClient() {
        return this.client;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map