import { PrismaService } from '../prisma/prisma.service';
import { QueryPaymentsDto, QueryPayoutsDto, PaymentStatsDto, RevenueChartDto } from './dto/payments.dto';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPaymentStats(): Promise<PaymentStatsDto>;
    getTransactions(query: QueryPaymentsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            transactionId: string | null;
            creator: string;
            creatorEmail: string;
            buyer: string;
            contentTitle: string;
            amount: number;
            currency: string;
            paymentMethod: string;
            status: string;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTransactionById(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            transactionId: string | null;
            paymentIntentId: string | null;
            creator: {
                id: string;
                name: string;
                email: string;
                profileImage: string | null;
            };
            buyer: {
                email: string | null;
                sessionId: string;
                fingerprint: string | null;
                ipAddress: string | null;
            };
            content: {
                id: string;
                title: string;
                thumbnailUrl: string;
            };
            amount: number;
            currency: string;
            paymentProvider: string;
            status: string;
            accessToken: string;
            viewCount: number;
            lastViewedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        message?: undefined;
    }>;
    getPayouts(query: QueryPayoutsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            creatorName: string;
            creatorEmail: string;
            amount: number;
            currency: string;
            status: string;
            paymentMethod: string;
            paymentId: string | null;
            processedAt: Date | null;
            notes: string | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    processPayout(payoutId: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            amount: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: string;
            creatorId: string;
            paymentMethod: string;
            paymentId: string | null;
            processedAt: Date | null;
            notes: string | null;
        };
    }>;
    getRevenueChart(period: 'weekly' | 'monthly' | 'yearly'): Promise<RevenueChartDto[]>;
}
//# sourceMappingURL=payments.service.d.ts.map