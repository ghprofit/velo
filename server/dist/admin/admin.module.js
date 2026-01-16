"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const creators_controller_1 = require("./creators.controller");
const creators_service_1 = require("./creators.service");
const content_controller_1 = require("./content.controller");
const content_service_1 = require("./content.service");
const payments_controller_1 = require("./payments.controller");
const payments_service_1 = require("./payments.service");
const support_controller_1 = require("./support.controller");
const support_service_1 = require("./support.service");
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const prisma_module_1 = require("../prisma/prisma.module");
const email_module_1 = require("../email/email.module");
const notifications_module_1 = require("../notifications/notifications.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, email_module_1.EmailModule, notifications_module_1.NotificationsModule],
        controllers: [admin_controller_1.AdminController, creators_controller_1.CreatorsController, content_controller_1.ContentController, payments_controller_1.PaymentsController, support_controller_1.SupportController, notifications_controller_1.NotificationsController, reports_controller_1.ReportsController],
        providers: [admin_service_1.AdminService, creators_service_1.CreatorsService, content_service_1.ContentService, payments_service_1.PaymentsService, support_service_1.SupportService, notifications_service_1.AdminNotificationsService, reports_service_1.ReportsService],
        exports: [admin_service_1.AdminService, creators_service_1.CreatorsService, content_service_1.ContentService, payments_service_1.PaymentsService, support_service_1.SupportService, notifications_service_1.AdminNotificationsService, reports_service_1.ReportsService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map