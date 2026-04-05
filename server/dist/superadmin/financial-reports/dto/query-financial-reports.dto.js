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
exports.QueryFinancialReportsDto = exports.TimeRange = exports.ReportType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ReportType;
(function (ReportType) {
    ReportType["REVENUE"] = "REVENUE";
    ReportType["PAYOUTS"] = "PAYOUTS";
    ReportType["TRANSACTIONS"] = "TRANSACTIONS";
    ReportType["OVERVIEW"] = "OVERVIEW";
})(ReportType || (exports.ReportType = ReportType = {}));
var TimeRange;
(function (TimeRange) {
    TimeRange["TODAY"] = "TODAY";
    TimeRange["YESTERDAY"] = "YESTERDAY";
    TimeRange["LAST_7_DAYS"] = "LAST_7_DAYS";
    TimeRange["LAST_30_DAYS"] = "LAST_30_DAYS";
    TimeRange["THIS_MONTH"] = "THIS_MONTH";
    TimeRange["LAST_MONTH"] = "LAST_MONTH";
    TimeRange["THIS_YEAR"] = "THIS_YEAR";
    TimeRange["CUSTOM"] = "CUSTOM";
})(TimeRange || (exports.TimeRange = TimeRange = {}));
class QueryFinancialReportsDto {
    constructor() {
        this.reportType = ReportType.OVERVIEW;
        this.timeRange = TimeRange.LAST_30_DAYS;
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.QueryFinancialReportsDto = QueryFinancialReportsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], QueryFinancialReportsDto.prototype, "reportType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TimeRange),
    __metadata("design:type", String)
], QueryFinancialReportsDto.prototype, "timeRange", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryFinancialReportsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryFinancialReportsDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryFinancialReportsDto.prototype, "creatorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryFinancialReportsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryFinancialReportsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryFinancialReportsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryFinancialReportsDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], QueryFinancialReportsDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=query-financial-reports.dto.js.map