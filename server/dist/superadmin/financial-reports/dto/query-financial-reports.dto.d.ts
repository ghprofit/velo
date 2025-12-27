export declare enum ReportType {
    REVENUE = "REVENUE",
    PAYOUTS = "PAYOUTS",
    TRANSACTIONS = "TRANSACTIONS",
    OVERVIEW = "OVERVIEW"
}
export declare enum TimeRange {
    TODAY = "TODAY",
    YESTERDAY = "YESTERDAY",
    LAST_7_DAYS = "LAST_7_DAYS",
    LAST_30_DAYS = "LAST_30_DAYS",
    THIS_MONTH = "THIS_MONTH",
    LAST_MONTH = "LAST_MONTH",
    THIS_YEAR = "THIS_YEAR",
    CUSTOM = "CUSTOM"
}
export declare class QueryFinancialReportsDto {
    reportType?: ReportType;
    timeRange?: TimeRange;
    startDate?: string;
    endDate?: string;
    creatorId?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=query-financial-reports.dto.d.ts.map