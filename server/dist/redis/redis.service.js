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
const redis_1 = require("redis");
let RedisService = RedisService_1 = class RedisService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.isConnected = false;
        this.hasLoggedError = false;
        this.initializeClient();
    }
    async initializeClient() {
        this.client = (0, redis_1.createClient)({
            socket: {
                host: this.config.get('REDIS_HOST') || 'localhost',
                port: parseInt(this.config.get('REDIS_PORT') || '6379'),
                reconnectStrategy: false,
            },
            password: this.config.get('REDIS_PASSWORD') || undefined,
            database: parseInt(this.config.get('REDIS_DB') || '0'),
        });
        this.client.on('error', (err) => {
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
        }
        catch (error) {
            this.isConnected = false;
            this.logger.warn('Redis is unavailable - application will continue without caching');
        }
    }
    async get(key) {
        if (!this.isConnected)
            return null;
        try {
            return await this.client.get(key);
        }
        catch (error) {
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.isConnected)
            return;
        try {
            if (ttl) {
                await this.client.setEx(key, ttl, value);
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
        if (this.client && this.isConnected) {
            try {
                await this.client.quit();
                this.logger.log('Redis Client Disconnected');
            }
            catch (error) {
            }
        }
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