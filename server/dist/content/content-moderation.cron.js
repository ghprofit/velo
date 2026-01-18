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
var ContentModerationCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModerationCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const content_service_1 = require("./content.service");
let ContentModerationCron = ContentModerationCron_1 = class ContentModerationCron {
    constructor(contentService) {
        this.contentService = contentService;
        this.logger = new common_1.Logger(ContentModerationCron_1.name);
    }
    async checkVideoModerationJobs() {
        try {
            this.logger.debug('Checking pending video moderation jobs...');
            await this.contentService.processVideoModerationJobs();
        }
        catch (error) {
            const err = error;
            if (!err.message.includes('Connection terminated') && !err.message.includes('timeout')) {
                this.logger.error(`Video moderation cron failed: ${err.message}`);
            }
            else {
                this.logger.warn('Video moderation cron: Connection timeout (will retry)');
            }
        }
    }
};
exports.ContentModerationCron = ContentModerationCron;
__decorate([
    (0, schedule_1.Cron)('0 */2 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContentModerationCron.prototype, "checkVideoModerationJobs", null);
exports.ContentModerationCron = ContentModerationCron = ContentModerationCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [content_service_1.ContentService])
], ContentModerationCron);
//# sourceMappingURL=content-moderation.cron.js.map