"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VeriffModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriffModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const veriff_service_1 = require("./veriff.service");
const veriff_controller_1 = require("./veriff.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const veriff_constants_1 = require("./constants/veriff.constants");
let VeriffModule = VeriffModule_1 = class VeriffModule {
    static register(options) {
        const optionsProvider = {
            provide: veriff_constants_1.VERIFF_MODULE_OPTIONS,
            useValue: options,
        };
        return {
            module: VeriffModule_1,
            controllers: [veriff_controller_1.VeriffController],
            providers: [optionsProvider, veriff_service_1.VeriffService],
            exports: [veriff_service_1.VeriffService],
        };
    }
    static registerAsync(options) {
        const optionsProvider = {
            provide: veriff_constants_1.VERIFF_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || [],
        };
        return {
            module: VeriffModule_1,
            imports: options.imports || [],
            controllers: [veriff_controller_1.VeriffController],
            providers: [optionsProvider, veriff_service_1.VeriffService],
            exports: [veriff_service_1.VeriffService],
        };
    }
    static forRoot() {
        return {
            module: VeriffModule_1,
            imports: [config_1.ConfigModule, prisma_module_1.PrismaModule],
            controllers: [veriff_controller_1.VeriffController],
            providers: [
                {
                    provide: veriff_constants_1.VERIFF_MODULE_OPTIONS,
                    useFactory: (configService) => ({
                        apiKey: configService.get('VERIFF_API_KEY'),
                        apiSecret: configService.get('VERIFF_API_SECRET'),
                        baseUrl: configService.get('VERIFF_BASE_URL'),
                        webhookSecret: configService.get('VERIFF_WEBHOOK_SECRET'),
                    }),
                    inject: [config_1.ConfigService],
                },
                veriff_service_1.VeriffService,
            ],
            exports: [veriff_service_1.VeriffService],
        };
    }
};
exports.VeriffModule = VeriffModule;
exports.VeriffModule = VeriffModule = VeriffModule_1 = __decorate([
    (0, common_1.Module)({})
], VeriffModule);
//# sourceMappingURL=veriff.module.js.map