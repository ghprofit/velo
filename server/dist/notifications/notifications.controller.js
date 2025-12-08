"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const notifications_service_1 = require("./notifications.service");
const create_notification_dto_1 = require("./dto/create-notification.dto");
const broadcast_notification_dto_1 = require("./dto/broadcast-notification.dto");
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async getNotifications(req, category) {
        const notifications = await this.notificationsService.getNotifications(req.user.id, category);
        return {
            success: true,
            data: notifications,
        };
    }
    async getStats(req) {
        const stats = await this.notificationsService.getStats(req.user.id);
        return {
            success: true,
            data: stats,
        };
    }
    async markAsRead(req, id) {
        const notification = await this.notificationsService.markAsRead(req.user.id, id);
        return {
            success: true,
            data: notification,
        };
    }
    async markAllAsRead(req) {
        await this.notificationsService.markAllAsRead(req.user.id);
        return {
            success: true,
            message: 'All notifications marked as read',
        };
    }
    async clearAllRead(req) {
        await this.notificationsService.clearAllRead(req.user.id);
        return {
            success: true,
            message: 'All read notifications cleared',
        };
    }
    async deleteNotification(req, id) {
        await this.notificationsService.deleteNotification(req.user.id, id);
        return {
            success: true,
            message: 'Notification deleted',
        };
    }
    async getAllNotifications(page, limit, type, userId, isRead, startDate, endDate) {
        const notifications = await this.notificationsService.getAllNotifications({
            page,
            limit,
            type,
            userId,
            isRead: isRead !== undefined ? isRead === 'true' : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
        return {
            success: true,
            ...notifications,
        };
    }
    async getAdminStats() {
        const stats = await this.notificationsService.getAdminStats();
        return {
            success: true,
            data: stats,
        };
    }
    async createNotification(dto) {
        const notification = await this.notificationsService.createNotification(dto);
        return {
            success: true,
            data: notification,
            message: 'Notification created successfully',
        };
    }
    async sendToMultipleUsers(dto) {
        const result = await this.notificationsService.sendToMultipleUsers(dto);
        return {
            success: true,
            data: result,
            message: `Notification sent to ${result.count} users`,
        };
    }
    async broadcastNotification(dto) {
        const result = await this.notificationsService.broadcastNotification(dto);
        return {
            success: true,
            data: result,
            message: `Notification broadcast to ${result.recipientCount} users`,
        };
    }
    async adminDeleteNotification(id) {
        await this.notificationsService.adminDeleteNotification(id);
        return {
            success: true,
            message: 'Notification deleted',
        };
    }
    async bulkDeleteNotifications(ids) {
        const result = await this.notificationsService.bulkDeleteNotifications(ids);
        return {
            success: true,
            data: result,
            message: `${result.deletedCount} notifications deleted`,
        };
    }
    async deleteUserNotifications(userId) {
        const result = await this.notificationsService.deleteUserNotifications(userId);
        return {
            success: true,
            data: result,
            message: `${result.deletedCount} notifications deleted for user`,
        };
    }
    async getUserNotifications(userId, category) {
        const notifications = await this.notificationsService.getNotifications(userId, category);
        return {
            success: true,
            data: notifications,
        };
    }
    async getNotificationTypes() {
        const { NotificationType } = await Promise.resolve().then(() => __importStar(require('./dto/create-notification.dto')));
        const { TargetRole } = await Promise.resolve().then(() => __importStar(require('./dto/broadcast-notification.dto')));
        return {
            success: true,
            data: {
                notificationTypes: Object.values(NotificationType),
                targetRoles: Object.values(TargetRole),
            },
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)('read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "clearAllRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('isRead')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAllNotifications", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getAdminStats", null);
__decorate([
    (0, common_1.Post)('admin/create'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_dto_1.CreateNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Post)('admin/send-multiple'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [broadcast_notification_dto_1.SendToMultipleUsersDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendToMultipleUsers", null);
__decorate([
    (0, common_1.Post)('admin/broadcast'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [broadcast_notification_dto_1.BroadcastNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "broadcastNotification", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "adminDeleteNotification", null);
__decorate([
    (0, common_1.Delete)('admin/bulk'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "bulkDeleteNotifications", null);
__decorate([
    (0, common_1.Delete)('admin/user/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteUserNotifications", null);
__decorate([
    (0, common_1.Get)('admin/user/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('admin/types'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotificationTypes", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map