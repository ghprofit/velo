"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const email_verified_guard_1 = require("./guards/email-verified.guard");
const verified_creator_guard_1 = require("./guards/verified-creator.guard");
const payout_eligible_guard_1 = require("./guards/payout-eligible.guard");
const prisma_module_1 = require("../prisma/prisma.module");
const email_module_1 = require("../email/email.module");
const twofactor_module_1 = require("../twofactor/twofactor.module");
const redis_module_1 = require("../redis/redis.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            email_module_1.EmailModule,
            twofactor_module_1.TwofactorModule,
            redis_module_1.RedisModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (config) => {
                    const secret = config.get('JWT_SECRET');
                    if (!secret) {
                        throw new Error('JWT_SECRET is not defined in environment variables. Please set JWT_SECRET in your .env file.');
                    }
                    return {
                        secret,
                        signOptions: {
                            expiresIn: config.get('JWT_EXPIRES_IN') || '15m',
                        },
                    };
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            email_verified_guard_1.EmailVerifiedGuard,
            verified_creator_guard_1.VerifiedCreatorGuard,
            payout_eligible_guard_1.PayoutEligibleGuard,
        ],
        exports: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            email_verified_guard_1.EmailVerifiedGuard,
            verified_creator_guard_1.VerifiedCreatorGuard,
            payout_eligible_guard_1.PayoutEligibleGuard,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map