"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const content_controller_1 = require("./content.controller");
const content_service_1 = require("./content.service");
const content_moderation_cron_1 = require("./content-moderation.cron");
const prisma_module_1 = require("../prisma/prisma.module");
const s3_module_1 = require("../s3/s3.module");
const recognition_module_1 = require("../recognition/recognition.module");
const email_module_1 = require("../email/email.module");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, s3_module_1.S3Module, recognition_module_1.RecognitionModule, email_module_1.EmailModule],
        controllers: [content_controller_1.ContentController],
        providers: [content_service_1.ContentService, content_moderation_cron_1.ContentModerationCron],
        exports: [content_service_1.ContentService],
    })
], ContentModule);
//# sourceMappingURL=content.module.js.map