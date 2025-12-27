"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const buyer_module_1 = require("./buyer/buyer.module");
const verification_module_1 = require("./verification/verification.module");
const redis_module_1 = require("./redis/redis.module");
const veriff_module_1 = require("./veriff/veriff.module");
const creators_module_1 = require("./creators/creators.module");
const content_module_1 = require("./content/content.module");
const s3_module_1 = require("./s3/s3.module");
const support_module_1 = require("./support/support.module");
const analytics_module_1 = require("./analytics/analytics.module");
const earnings_module_1 = require("./earnings/earnings.module");
const notifications_module_1 = require("./notifications/notifications.module");
const stripe_module_1 = require("./stripe/stripe.module");
const superadmin_module_1 = require("./superadmin/superadmin.module");
const admin_module_1 = require("./admin/admin.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    throttlers: [
                        {
                            ttl: config.get('THROTTLE_TTL') || 60000,
                            limit: config.get('THROTTLE_LIMIT') || 100,
                        },
                    ],
                }),
            }),
            redis_module_1.RedisModule,
            prisma_module_1.PrismaModule,
            s3_module_1.S3Module,
            stripe_module_1.StripeModule,
            auth_module_1.AuthModule,
            buyer_module_1.BuyerModule,
            verification_module_1.VerificationModule,
            veriff_module_1.VeriffModule.forRoot(),
            creators_module_1.CreatorsModule,
            content_module_1.ContentModule,
            support_module_1.SupportModule,
            analytics_module_1.AnalyticsModule,
            earnings_module_1.EarningsModule,
            notifications_module_1.NotificationsModule,
            superadmin_module_1.SuperadminModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map