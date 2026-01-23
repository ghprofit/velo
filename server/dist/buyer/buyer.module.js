"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerModule = void 0;
const common_1 = require("@nestjs/common");
const buyer_controller_1 = require("./buyer.controller");
const buyer_service_1 = require("./buyer.service");
const prisma_module_1 = require("../prisma/prisma.module");
const stripe_module_1 = require("../stripe/stripe.module");
const email_module_1 = require("../email/email.module");
const s3_module_1 = require("../s3/s3.module");
const redis_module_1 = require("../redis/redis.module");
const notifications_module_1 = require("../notifications/notifications.module");
let BuyerModule = class BuyerModule {
};
exports.BuyerModule = BuyerModule;
exports.BuyerModule = BuyerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            stripe_module_1.StripeModule,
            email_module_1.EmailModule,
            s3_module_1.S3Module,
            redis_module_1.RedisModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [buyer_controller_1.BuyerController],
        providers: [buyer_service_1.BuyerService],
        exports: [buyer_service_1.BuyerService],
    })
], BuyerModule);
//# sourceMappingURL=buyer.module.js.map