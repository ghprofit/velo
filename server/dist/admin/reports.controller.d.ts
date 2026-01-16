import { ReportsService } from './reports.service';
export interface CreatorPerformanceDto {
    creatorId: string;
    creatorName: string;
    totalViews: number;
    totalRevenue: number;
    contentCount: number;
    engagement: number;
    category: string;
}
export interface CreatorPerformanceResponse {
    success: boolean;
    data: CreatorPerformanceDto[];
}
export interface AnalyticsOverviewDto {
    totalRevenue: number;
    revenueGrowth: number;
    activeCreators: number;
    creatorsGrowth: number;
    contentUploaded: number;
    contentGrowth: number;
    avgTransactionValue: number;
}
export interface AnalyticsOverviewResponse {
    success: boolean;
    data: AnalyticsOverviewDto;
}
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getCreatorPerformance(limit?: number, sortBy?: 'revenue' | 'views' | 'engagement'): Promise<CreatorPerformanceResponse>;
    getAnalyticsOverview(): Promise<AnalyticsOverviewResponse>;
}
//# sourceMappingURL=reports.controller.d.ts.map