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
var WaitlistService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WaitlistService = WaitlistService_1 = class WaitlistService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WaitlistService_1.name);
    }
    async addToWaitlist(dto) {
        const email = dto.email.toLowerCase();
        const existing = await this.prisma.waitlist.findUnique({
            where: { email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already on waitlist');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const waitlistEntry = await this.prisma.waitlist.create({
            data: {
                email,
                country: dto.country,
                age: dto.age,
                heardFrom: dto.heardFrom,
            },
        });
        this.logger.log(`Added ${email} to waitlist`);
        return {
            success: true,
            message: 'Successfully added to waitlist',
            data: {
                id: waitlistEntry.id,
                email: waitlistEntry.email,
            },
        };
    }
    async checkEmail(email) {
        const entry = await this.prisma.waitlist.findUnique({
            where: { email: email.toLowerCase() },
        });
        return {
            isOnWaitlist: !!entry,
            email: email.toLowerCase(),
        };
    }
    async getWaitlistCount() {
        const count = await this.prisma.waitlist.count();
        return {
            count,
        };
    }
    async getAllWaitlistEntries(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [entries, total] = await Promise.all([
            this.prisma.waitlist.findMany({
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.waitlist.count(),
        ]);
        return {
            data: entries,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async removeFromWaitlist(email) {
        const entry = await this.prisma.waitlist.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!entry) {
            throw new common_1.ConflictException('Email not found on waitlist');
        }
        await this.prisma.waitlist.delete({
            where: { id: entry.id },
        });
        this.logger.log(`Removed ${email} from waitlist`);
        return {
            success: true,
            message: 'Successfully removed from waitlist',
        };
    }
};
exports.WaitlistService = WaitlistService;
exports.WaitlistService = WaitlistService = WaitlistService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaitlistService);
//# sourceMappingURL=waitlist.service.js.map