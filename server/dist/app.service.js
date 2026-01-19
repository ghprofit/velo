"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
        };
    }
    getAppInfo() {
        return {
            name: 'VeloLink API',
            description: 'Content platform with authentication, verification, and anonymous buyer tracking',
            version: '1.0.0',
            apiPrefix: 'api',
        };
    }
    getAWSHealth() {
        const hasS3Credentials = !!(process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY &&
            process.env.AWS_REGION);
        const hasRekognition = !!(process.env.AWS_ACCESS_KEY_ID &&
            process.env.AWS_SECRET_ACCESS_KEY);
        return {
            s3: {
                configured: hasS3Credentials,
                bucket: process.env.AWS_S3_BUCKET_NAME || 'NOT_SET',
                region: process.env.AWS_REGION || 'NOT_SET',
                hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
            },
            rekognition: {
                configured: hasRekognition,
                region: process.env.AWS_REGION || 'NOT_SET',
                minConfidence: process.env.AWS_REKOGNITION_MIN_CONFIDENCE || '70',
            },
            ses: {
                configured: !!process.env.SES_FROM_EMAIL,
                fromEmail: process.env.SES_FROM_EMAIL || 'NOT_SET',
            },
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map