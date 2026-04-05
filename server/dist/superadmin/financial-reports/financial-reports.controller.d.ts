import { FinancialReportsService } from './financial-reports.service';
import { QueryFinancialReportsDto } from './dto/query-financial-reports.dto';
export declare class FinancialReportsController {
    private readonly financialReportsService;
    constructor(financialReportsService: FinancialReportsService);
    getFinancialOverview(query: QueryFinancialReportsDto): Promise<{
        totalRevenue: number;
        totalPayouts: number;
        platformRevenue: number;
        pendingPayoutsAmount: number;
        pendingPayoutsCount: number;
        totalTransactions: number;
        avgTransactionValue: number;
        topCreators: {
            id: string;
            name: string;
            email: string;
            totalEarnings: number;
        }[];
        dateRange: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    getRevenueReport(query: QueryFinancialReportsDto): Promise<{
        data: {
            id: string;
            amount: number;
            currency: string;
            paymentProvider: string;
            transactionId: string | null;
            status: string;
            createdAt: Date;
            content: {
                id: string;
                title: string;
                price: number;
            };
            creator: {
                id: string;
                name: string;
                email: string;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPayoutReport(query: QueryFinancialReportsDto): Promise<{
        data: {
            id: string;
            amount: number;
            currency: string;
            status: string;
            paymentMethod: string;
            paymentId: string | null;
            processedAt: Date | null;
            notes: string | null;
            createdAt: Date;
            creator: {
                id: string;
                name: string;
                email: string;
                paypalEmail: string | null;
                stripeAccountId: string | null;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getRevenueAnalytics(query: QueryFinancialReportsDto): Promise<{
        dailyRevenue: {
            date: Date;
            revenue: number;
            transactions: number;
        }[];
        dateRange: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    getPayoutStats(): Promise<{
        pending: {
            count: number;
            amount: number;
        };
        processing: {
            count: number;
            amount: number;
        };
        completed: {
            count: number;
            amount: number;
        };
        failed: {
            count: number;
            amount: number;
        };
    }>;
    getCreatorEarnings(query: QueryFinancialReportsDto): Promise<{
        data: {
            id: string;
            name: string;
            email: string;
            totalEarnings: number;
            totalPurchases: number;
            payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
            totalPayouts: number;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=financial-reports.controller.d.ts.map