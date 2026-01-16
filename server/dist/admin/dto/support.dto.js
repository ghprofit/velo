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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignTicketDto = exports.UpdateTicketPriorityDto = exports.UpdateTicketStatusDto = exports.QuerySupportTicketsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class QuerySupportTicketsDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.QuerySupportTicketsDto = QuerySupportTicketsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySupportTicketsDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    __metadata("design:type", String)
], QuerySupportTicketsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    __metadata("design:type", String)
], QuerySupportTicketsDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySupportTicketsDto.prototype, "assignedTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QuerySupportTicketsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QuerySupportTicketsDto.prototype, "limit", void 0);
class UpdateTicketStatusDto {
}
exports.UpdateTicketStatusDto = UpdateTicketStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    __metadata("design:type", String)
], UpdateTicketStatusDto.prototype, "status", void 0);
class UpdateTicketPriorityDto {
}
exports.UpdateTicketPriorityDto = UpdateTicketPriorityDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    __metadata("design:type", String)
], UpdateTicketPriorityDto.prototype, "priority", void 0);
class AssignTicketDto {
}
exports.AssignTicketDto = AssignTicketDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignTicketDto.prototype, "assignedTo", void 0);
//# sourceMappingURL=support.dto.js.map