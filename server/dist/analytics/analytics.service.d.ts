import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCreatorOverview(userId: string, period?: string): Promise<{
        totalRevenue: number;
        totalUnlocks: number;
        totalViews: number;
    }>;
    getPerformanceTrends(userId: string, period?: string, metric?: string): Promise<{
        data: {
            date: string | undefined;
            revenue: number;
            unlocks: number;
            views: number;
        }[];
        metric: string;
    }>;
    getContentPerformance(userId: string, options: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<{
        items: {
            id: string;
            title: string;
            type: string;
            size: string;
            views: number;
            unlocks: number;
            revenue: number;
            thumbnailUrl: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private getDateRange;
    private getDaysInRange;
    private formatFileSize;
    getGeographicDistribution(userId: string, period?: string): Promise<{
        countries: {
            country: string;
            countryCode: string;
            views: number;
            percentage: number;
        }[];
        totalViews: number;
    }>;
    getDeviceDistribution(userId: string, period?: string): Promise<{
        devices: {
            device: string;
            views: number;
            percentage: number;
        }[];
        totalViews: number;
    }>;
    getBrowserDistribution(userId: string, period?: string): Promise<{
        browsers: {
            browser: string;
            views: number;
            percentage: number;
        }[];
        totalViews: number;
    }>;
    getDemographics(userId: string, period?: string): Promise<{
        geographic: {
            countries: {
                country: string;
                countryCode: string;
                views: number;
                percentage: number;
            }[];
            totalViews: number;
        };
        devices: {
            devices: {
                device: string;
                views: number;
                percentage: number;
            }[];
            totalViews: number;
        };
        browsers: {
            browsers: {
                browser: string;
                views: number;
                percentage: number;
            }[];
            totalViews: number;
        };
    }>;
    recordContentView(contentId: string, viewData: {
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
        country?: string;
        countryCode?: string;
        region?: string;
        city?: string;
        deviceType?: string;
        browser?: string;
        os?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        country: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        contentId: string;
        region: string | null;
        countryCode: string | null;
        city: string | null;
        deviceType: string | null;
        browser: string | null;
        os: string | null;
        referrer: string | null;
    }>;
    private formatDeviceType;
}
//# sourceMappingURL=analytics.service.d.ts.map