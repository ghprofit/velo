export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum PayoutStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class QueryPaymentsDto {
    search?: string;
    status?: PaymentStatus;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export declare class QueryPayoutsDto {
    search?: string;
    status?: PayoutStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export declare class PaymentStatsDto {
    totalRevenue: number;
    totalPayouts: number;
    pendingPayouts: number;
    failedTransactions: number;
}
export declare class ProcessPayoutDto {
    payoutId: string;
}
export declare class RevenueChartDto {
    period: string;
    revenue: number;
    count: number;
}
//# sourceMappingURL=payments.dto.d.ts.map