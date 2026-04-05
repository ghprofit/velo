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
exports.WaitlistController = void 0;
const common_1 = require("@nestjs/common");
const waitlist_service_1 = require("./waitlist.service");
const join_waitlist_dto_1 = require("./dto/join-waitlist.dto");
let WaitlistController = class WaitlistController {
    constructor(waitlistService) {
        this.waitlistService = waitlistService;
    }
    async joinWaitlist(dto) {
        return this.waitlistService.addToWaitlist(dto);
    }
    async checkWaitlist(email) {
        return this.waitlistService.checkEmail(email);
    }
    async getCount() {
        return this.waitlistService.getWaitlistCount();
    }
    async getAllEntries(page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 50;
        return this.waitlistService.getAllWaitlistEntries(pageNum, limitNum);
    }
    async removeFromWaitlist(email) {
        return this.waitlistService.removeFromWaitlist(email);
    }
};
exports.WaitlistController = WaitlistController;
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [join_waitlist_dto_1.JoinWaitlistDto]),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "joinWaitlist", null);
__decorate([
    (0, common_1.Get)('check/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "checkWaitlist", null);
__decorate([
    (0, common_1.Get)('count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "getCount", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "getAllEntries", null);
__decorate([
    (0, common_1.Delete)(':email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "removeFromWaitlist", null);
exports.WaitlistController = WaitlistController = __decorate([
    (0, common_1.Controller)('waitlist'),
    __metadata("design:paramtypes", [waitlist_service_1.WaitlistService])
], WaitlistController);
//# sourceMappingURL=waitlist.controller.js.map