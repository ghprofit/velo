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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const support_service_1 = require("./support.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../auth/guards/admin.guard");
const support_dto_1 = require("./dto/support.dto");
let SupportController = class SupportController {
    constructor(supportService) {
        this.supportService = supportService;
    }
    async getSupportStats() {
        const stats = await this.supportService.getSupportStats();
        return {
            success: true,
            data: stats,
        };
    }
    async getAllTickets(query) {
        return this.supportService.getAllTickets(query);
    }
    async getTicketById(id) {
        return this.supportService.getTicketById(id);
    }
    async updateTicketStatus(id, body) {
        return this.supportService.updateTicketStatus(id, body.status);
    }
    async updateTicketPriority(id, body) {
        return this.supportService.updateTicketPriority(id, body.priority);
    }
    async assignTicket(id, body) {
        return this.supportService.assignTicket(id, body.assignedTo);
    }
    async deleteTicket(id) {
        return this.supportService.deleteTicket(id);
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getSupportStats", null);
__decorate([
    (0, common_1.Get)('tickets'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.QuerySupportTicketsDto]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getAllTickets", null);
__decorate([
    (0, common_1.Get)('tickets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getTicketById", null);
__decorate([
    (0, common_1.Put)('tickets/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.UpdateTicketStatusDto]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "updateTicketStatus", null);
__decorate([
    (0, common_1.Put)('tickets/:id/priority'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.UpdateTicketPriorityDto]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "updateTicketPriority", null);
__decorate([
    (0, common_1.Put)('tickets/:id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.AssignTicketDto]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "assignTicket", null);
__decorate([
    (0, common_1.Delete)('tickets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "deleteTicket", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('admin/support'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportController);
//# sourceMappingURL=support.controller.js.map