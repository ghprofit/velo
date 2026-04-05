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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCreatorOverview(userId, period) {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creator) {
            return {
                totalRevenue: 0,
                totalUnlocks: 0,
                totalViews: 0,
            };
        }
        const dateRange = this.getDateRange(period);
        const purchaseWhere = {
            content: {
                creatorId: creator.id,
            },
            status: 'COMPLETED',
        };
        if (dateRange) {
            purchaseWhere.createdAt = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const purchases = await this.prisma.purchase.findMany({
            where: purchaseWhere,
            select: {
                amount: true,
                basePrice: true,
            },
        });
        const totalRevenue = purchases.reduce((sum, p) => {
            const net = p.basePrice != null ? p.basePrice * 0.9 : p.amount * 0.85;
            return sum + net;
        }, 0);
        const totalUnlocks = purchases.length;
        const contents = await this.prisma.content.findMany({
            where: {
                creatorId: creator.id,
            },
            select: {
                viewCount: true,
            },
        });
        const totalViews = contents.reduce((sum, c) => sum + c.viewCount, 0);
        return {
            totalRevenue,
            totalUnlocks,
            totalViews,
        };
    }
    async getPerformanceTrends(userId, period, metric) {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creator) {
            return { data: [], metric: metric || 'revenue' };
        }
        let dateRange = this.getDateRange(period);
        if (!dateRange) {
            const oldestPurchase = await this.prisma.purchase.findFirst({
                where: {
                    content: {
                        creatorId: creator.id,
                    },
                    status: 'COMPLETED',
                },
                orderBy: {
                    createdAt: 'asc',
                },
                select: {
                    createdAt: true,
                },
            });
            const now = new Date();
            if (oldestPurchase) {
                const startDate = new Date(oldestPurchase.createdAt);
                startDate.setHours(0, 0, 0, 0);
                dateRange = { startDate, endDate: now };
            }
            else {
                const startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                dateRange = { startDate, endDate: now };
            }
        }
        const days = this.getDaysInRange(dateRange);
        const purchases = await this.prisma.purchase.findMany({
            where: {
                content: {
                    creatorId: creator.id,
                },
                status: 'COMPLETED',
                createdAt: {
                    gte: dateRange.startDate,
                    lte: dateRange.endDate,
                },
            },
            select: {
                amount: true,
                basePrice: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        const trendData = days.map((date) => {
            const dayPurchases = purchases.filter((p) => {
                const purchaseDate = new Date(p.createdAt).toDateString();
                return purchaseDate === date.toDateString();
            });
            const revenue = dayPurchases.reduce((sum, p) => {
                const net = p.basePrice != null ? p.basePrice * 0.9 : p.amount * 0.85;
                return sum + net;
            }, 0);
            const unlocks = dayPurchases.length;
            return {
                date: date.toISOString().split('T')[0],
                revenue,
                unlocks,
                views: 0,
            };
        });
        return {
            data: trendData,
            metric: metric || 'revenue',
        };
    }
    async getContentPerformance(userId, options) {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creator) {
            return {
                items: [],
                total: 0,
                page: options.page,
                limit: options.limit,
                totalPages: 0,
            };
        }
        const skip = (options.page - 1) * options.limit;
        const where = {
            creatorId: creator.id,
            isPublished: true,
        };
        if (options.search) {
            where.title = {
                contains: options.search,
                mode: 'insensitive',
            };
        }
        const total = await this.prisma.content.count({ where });
        const contents = await this.prisma.content.findMany({
            where,
            select: {
                id: true,
                title: true,
                contentType: true,
                fileSize: true,
                viewCount: true,
                purchaseCount: true,
                totalRevenue: true,
                thumbnailUrl: true,
                createdAt: true,
                status: true,
                complianceStatus: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: options.limit,
        });
        const contentIds = contents.map((c) => c.id);
        let revenueMap = {};
        if (contentIds.length > 0) {
            const purchases = await this.prisma.purchase.findMany({
                where: {
                    contentId: { in: contentIds },
                    status: 'COMPLETED',
                },
                select: {
                    contentId: true,
                    amount: true,
                    basePrice: true,
                },
            });
            revenueMap = purchases.reduce((acc, p) => {
                const net = p.basePrice != null ? p.basePrice * 0.9 : p.amount * 0.85;
                acc[p.contentId] = (acc[p.contentId] || 0) + net;
                return acc;
            }, {});
        }
        const items = contents.map((content) => ({
            id: content.id,
            title: content.title,
            type: content.contentType,
            size: this.formatFileSize(content.fileSize),
            views: content.viewCount,
            unlocks: content.purchaseCount,
            revenue: revenueMap[content.id] ?? 0,
            thumbnailUrl: content.thumbnailUrl,
            status: content.status,
            complianceStatus: content.complianceStatus,
            createdAt: content.createdAt,
        }));
        return {
            items,
            total,
            page: options.page,
            limit: options.limit,
            totalPages: Math.ceil(total / options.limit),
        };
    }
    getDateRange(period) {
        if (!period || period === 'All Time') {
            return null;
        }
        const now = new Date();
        const endDate = new Date(now);
        const startDate = new Date(now);
        switch (period) {
            case 'Last 7 Days':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'Last 30 Days':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'Last 3 Months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'Last Year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return null;
        }
        return { startDate, endDate };
    }
    getDaysInRange(dateRange) {
        const days = [];
        const current = new Date(dateRange.startDate);
        while (current <= dateRange.endDate) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    }
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
    async getGeographicDistribution(userId, period) {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creator) {
            return { countries: [], totalViews: 0 };
        }
        const contents = await this.prisma.content.findMany({
            where: { creatorId: creator.id },
            select: { id: true },
        });
        const contentIds = contents.map((c) => c.id);
        if (contentIds.length === 0) {
            return { countries: [], totalViews: 0 };
        }
        const dateRange = this.getDateRange(period);
        const whereClause = {
            contentId: { in: contentIds },
            country: { not: null },
        };
        if (dateRange) {
            whereClause.createdAt = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const countryViews = await this.prisma.contentView.groupBy({
            by: ['country', 'countryCode'],
            where: whereClause,
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: 10,
        });
        const totalViews = await this.prisma.contentView.count({
            where: {
                contentId: { in: contentIds },
                ...(dateRange && {
                    createdAt: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate,
                    },
                }),
            },
        });
        const countries = countryViews.map((cv) => ({
            country: cv.country || 'Unknown',
            countryCode: cv.countryCode || 'XX',
            views: cv._count.id,
            percentage: totalViews > 0 ? Math.round((cv._count.id / totalViews) * 100) : 0,
        }));
        return {
            countries,
            totalViews,
        };
    }
    async getDeviceDistribution(userId, period) {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creator) {
            return { devices: [], totalViews: 0 };
        }
        const contents = await this.prisma.content.findMany({
            where: { creatorId: creator.id },
            select: { id: true },
        });
        const contentIds = contents.map((c) => c.id);
        if (contentIds.length === 0) {
            return { devices: [], totalViews: 0 };
        }
        const dateRange = this.getDateRange(period);
        const whereClause = {
            contentId: { in: contentIds },
            deviceType: { not: null },
        };
        if (dateRange) {
            whereClause.createdAt = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const deviceViews = await this.prisma.contentView.groupBy({
            by: ['deviceType'],
            where: whereClause,
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
        });
        const totalViews = await this.prisma.contentView.count({
            where: {
                contentId: { in: contentIds },
                ...(dateRange && {
                    createdAt: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate,
                    },
                }),
            },
        });
        const devices = deviceViews.map((dv) => ({
            device: this.formatDeviceType(dv.deviceType || 'unknown'),
            views: dv._count.id,
            percentage: totalViews > 0 ? Math.round((dv._count.id / totalViews) * 100) : 0,
        }));
        return {
            devices,
            totalViews,
        };
    }
    async getBrowserDistribution(userId, period) {
        const creator = await this.prisma.creatorProfile.findUnique({
            where: { userId },
        });
        if (!creator) {
            return { browsers: [], totalViews: 0 };
        }
        const contents = await this.prisma.content.findMany({
            where: { creatorId: creator.id },
            select: { id: true },
        });
        const contentIds = contents.map((c) => c.id);
        if (contentIds.length === 0) {
            return { browsers: [], totalViews: 0 };
        }
        const dateRange = this.getDateRange(period);
        const whereClause = {
            contentId: { in: contentIds },
            browser: { not: null },
        };
        if (dateRange) {
            whereClause.createdAt = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const browserViews = await this.prisma.contentView.groupBy({
            by: ['browser'],
            where: whereClause,
            _count: {
                id: true,
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: 5,
        });
        const totalViews = await this.prisma.contentView.count({
            where: {
                contentId: { in: contentIds },
                ...(dateRange && {
                    createdAt: {
                        gte: dateRange.startDate,
                        lte: dateRange.endDate,
                    },
                }),
            },
        });
        const browsers = browserViews.map((bv) => ({
            browser: bv.browser || 'Unknown',
            views: bv._count.id,
            percentage: totalViews > 0 ? Math.round((bv._count.id / totalViews) * 100) : 0,
        }));
        return {
            browsers,
            totalViews,
        };
    }
    async getDemographics(userId, period) {
        const [geographic, devices, browsers] = await Promise.all([
            this.getGeographicDistribution(userId, period),
            this.getDeviceDistribution(userId, period),
            this.getBrowserDistribution(userId, period),
        ]);
        return {
            geographic,
            devices,
            browsers,
        };
    }
    async recordContentView(contentId, viewData) {
        await this.prisma.content.update({
            where: { id: contentId },
            data: {
                viewCount: { increment: 1 },
            },
        });
        const content = await this.prisma.content.findUnique({
            where: { id: contentId },
            select: { creatorId: true },
        });
        if (content) {
            await this.prisma.creatorProfile.update({
                where: { id: content.creatorId },
                data: {
                    totalViews: { increment: 1 },
                },
            });
        }
        return this.prisma.contentView.create({
            data: {
                contentId,
                ipAddress: viewData.ipAddress,
                userAgent: viewData.userAgent,
                referrer: viewData.referrer,
                country: viewData.country,
                countryCode: viewData.countryCode,
                region: viewData.region,
                city: viewData.city,
                deviceType: viewData.deviceType,
                browser: viewData.browser,
                os: viewData.os,
            },
        });
    }
    formatDeviceType(deviceType) {
        const types = {
            desktop: 'Desktop',
            mobile: 'Mobile',
            tablet: 'Tablet',
            unknown: 'Unknown',
        };
        return types[deviceType.toLowerCase()] || deviceType;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map