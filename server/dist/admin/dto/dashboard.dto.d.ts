export declare enum TimePeriod {
    SEVEN_DAYS = "7",
    THIRTY_DAYS = "30",
    NINETY_DAYS = "90"
}
export declare class GetRevenueQueryDto {
    period?: TimePeriod;
}
export declare class DashboardStatsResponseDto {
    totalCreators: number;
    activeCreators: number;
    inactiveCreators: number;
    totalEarnings: number;
    transactionsToday: number;
}
export declare class RevenueDataPointDto {
    date: string;
    amount: number;
}
export declare class RevenueResponseDto {
    data: RevenueDataPointDto[];
    period: string;
}
export declare class RecentActivityDto {
    id: string;
    creator: string;
    activity: string;
    date: string;
    status: string;
    statusColor: string;
}
export declare class RecentActivityResponseDto {
    data: RecentActivityDto[];
}
//# sourceMappingURL=dashboard.dto.d.ts.map