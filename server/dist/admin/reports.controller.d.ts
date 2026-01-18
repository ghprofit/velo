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
export interface RevenueTrendDto {
    period: string;
    revenue: number;
}
export interface RevenueTrendsResponse {
    success: boolean;
    data: RevenueTrendDto[];
}
export interface UserGrowthDto {
    period: string;
    count: number;
}
export interface UserGrowthResponse {
    success: boolean;
    data: UserGrowthDto[];
}
export interface ContentPerformanceDto {
    contentType: string;
    count: number;
    percentage: number;
}
export interface ContentPerformanceResponse {
    success: boolean;
    data: ContentPerformanceDto[];
}
export interface GeographicDistributionDto {
    country: string;
    percentage: number;
    count: number;
}
export interface GeographicDistributionResponse {
    success: boolean;
    data: GeographicDistributionDto[];
}
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getCreatorPerformance(limit?: number, sortBy?: 'revenue' | 'views' | 'engagement'): Promise<CreatorPerformanceResponse>;
    getAnalyticsOverview(): Promise<AnalyticsOverviewResponse>;
    getRevenueTrends(period?: 'WEEKLY' | 'MONTHLY' | 'YEARLY'): Promise<RevenueTrendsResponse>;
    getUserGrowth(userType?: 'CREATORS' | 'BUYERS'): Promise<UserGrowthResponse>;
    getContentPerformance(): Promise<ContentPerformanceResponse>;
    getGeographicDistribution(limit?: number): Promise<GeographicDistributionResponse>;
}
//# sourceMappingURL=reports.controller.d.ts.map