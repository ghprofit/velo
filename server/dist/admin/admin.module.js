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
const prisma_module_1 = require("../prisma/prisma.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [admin_controller_1.AdminController, creators_controller_1.CreatorsController, content_controller_1.ContentController],
        providers: [admin_service_1.AdminService, creators_service_1.CreatorsService, content_service_1.ContentService],
        exports: [admin_service_1.AdminService, creators_service_1.CreatorsService, content_service_1.ContentService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map