import { AnalyticsService } from './analytics.service';
interface AuthenticatedRequest {
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(req: AuthenticatedRequest, period?: string): Promise<{
        success: boolean;
        data: {
            totalRevenue: number;
            totalUnlocks: number;
            totalViews: number;
        };
    }>;
    getTrends(req: AuthenticatedRequest, period?: string, metric?: string): Promise<{
        success: boolean;
        data: {
            date: string | undefined;
            revenue: number;
            unlocks: number;
            views: number;
        }[];
        metric: string;
    }>;
    getContentPerformance(req: AuthenticatedRequest, page?: string, limit?: string, search?: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getDemographics(req: AuthenticatedRequest, period?: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getGeographicDistribution(req: AuthenticatedRequest, period?: string): Promise<{
        success: boolean;
        data: {
            countries: {
                country: string;
                countryCode: string;
                views: number;
                percentage: number;
            }[];
            totalViews: number;
        };
    }>;
    getDeviceDistribution(req: AuthenticatedRequest, period?: string): Promise<{
        success: boolean;
        data: {
            devices: {
                device: string;
                views: number;
                percentage: number;
            }[];
            totalViews: number;
        };
    }>;
    getBrowserDistribution(req: AuthenticatedRequest, period?: string): Promise<{
        success: boolean;
        data: {
            browsers: {
                browser: string;
                views: number;
                percentage: number;
            }[];
            totalViews: number;
        };
    }>;
    recordView(contentId: string, ip: string, userAgent: string, referrer: string, body: {
        country?: string;
        countryCode?: string;
        region?: string;
        city?: string;
        deviceType?: string;
        browser?: string;
        os?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
//# sourceMappingURL=analytics.controller.d.ts.map