"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperadminModule = void 0;
const common_1 = require("@nestjs/common");
const superadmin_controller_1 = require("./superadmin.controller");
const superadmin_service_1 = require("./superadmin.service");
const creators_controller_1 = require("./creators/creators.controller");
const creators_service_1 = require("./creators/creators.service");
const content_controller_1 = require("./content/content.controller");
const content_service_1 = require("./content/content.service");
const financial_reports_controller_1 = require("./financial-reports/financial-reports.controller");
const financial_reports_service_1 = require("./financial-reports/financial-reports.service");
const settings_controller_1 = require("./settings/settings.controller");
const settings_service_1 = require("./settings/settings.service");
const prisma_module_1 = require("../prisma/prisma.module");
const email_module_1 = require("../email/email.module");
const s3_module_1 = require("../s3/s3.module");
let SuperadminModule = class SuperadminModule {
};
exports.SuperadminModule = SuperadminModule;
exports.SuperadminModule = SuperadminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, email_module_1.EmailModule, s3_module_1.S3Module],
        controllers: [superadmin_controller_1.SuperadminController, creators_controller_1.CreatorsController, content_controller_1.ContentController, financial_reports_controller_1.FinancialReportsController, settings_controller_1.SettingsController],
        providers: [superadmin_service_1.SuperadminService, creators_service_1.CreatorsService, content_service_1.ContentService, financial_reports_service_1.FinancialReportsService, settings_service_1.SettingsService],
        exports: [superadmin_service_1.SuperadminService, creators_service_1.CreatorsService, content_service_1.ContentService, financial_reports_service_1.FinancialReportsService, settings_service_1.SettingsService],
    })
], SuperadminModule);
//# sourceMappingURL=superadmin.module.js.map