import { PrismaService } from '../prisma/prisma.service';
import { CreatorPerformanceResponse, AnalyticsOverviewResponse, RevenueTrendsResponse, UserGrowthResponse, ContentPerformanceResponse, GeographicDistributionResponse } from './reports.controller';
export declare class ReportsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCreatorPerformance(limit: number, sortBy: 'revenue' | 'views' | 'engagement'): Promise<CreatorPerformanceResponse>;
    getAnalyticsOverview(): Promise<AnalyticsOverviewResponse>;
    getRevenueTrends(period: 'WEEKLY' | 'MONTHLY' | 'YEARLY'): Promise<RevenueTrendsResponse>;
    getUserGrowth(userType: 'CREATORS' | 'BUYERS'): Promise<UserGrowthResponse>;
    getContentPerformance(): Promise<ContentPerformanceResponse>;
    getGeographicDistribution(limit?: number): Promise<GeographicDistributionResponse>;
}
//# sourceMappingURL=reports.service.d.ts.map