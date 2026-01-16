import { PrismaService } from '../prisma/prisma.service';
import { CreatorPerformanceResponse, AnalyticsOverviewResponse } from './reports.controller';
export declare class ReportsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getCreatorPerformance(limit: number, sortBy: 'revenue' | 'views' | 'engagement'): Promise<CreatorPerformanceResponse>;
    getAnalyticsOverview(): Promise<AnalyticsOverviewResponse>;
}
//# sourceMappingURL=reports.service.d.ts.map