import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StripeService } from '../stripe/stripe.service';
import { QueryPaymentsDto, QueryPayoutsDto, PaymentStatsDto, RevenueChartDto } from './dto/payments.dto';
export declare class PaymentsService {
    private readonly prisma;
    private readonly emailService;
    private readonly notificationsService;
    private readonly stripeService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService, notificationsService: NotificationsService, stripeService: StripeService);
    getPaymentStats(): Promise<PaymentStatsDto>;
    getTransactions(query: QueryPaymentsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            transactionId: string | null;
            creatorName: string;
            creatorEmail: string;
            buyerEmail: string;
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
    getPayoutRequestTransactions(query: QueryPaymentsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            transactionId: string;
            creatorName: string;
            creatorEmail: string;
            buyerEmail: string;
            contentTitle: string;
            amount: number;
            currency: string;
            paymentMethod: string;
            status: import(".prisma/client").$Enums.PayoutRequestStatus;
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
        data: {
            id: string;
            amount: number;
            status: string;
            paymentId: string | null;
            stripeStatus: string;
            estimatedArrival: string;
        };
    }>;
    getRevenueChart(period: 'weekly' | 'monthly' | 'yearly'): Promise<RevenueChartDto[]>;
    getPayoutRequests(query: {
        status?: string;
        creatorId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: ({
            payout: {
                amount: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                status: string;
                creatorId: string;
                processedAt: Date | null;
                paymentMethod: string;
                paymentId: string | null;
                notes: string | null;
            } | null;
            creator: {
                user: {
                    email: string;
                    displayName: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                displayName: string;
                firstName: string | null;
                lastName: string | null;
                country: string | null;
                bio: string | null;
                profileImage: string | null;
                coverImage: string | null;
                allowBuyerProfileView: boolean;
                verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
                veriffSessionId: string | null;
                veriffDecisionId: string | null;
                verifiedAt: Date | null;
                verificationNotes: string | null;
                dateOfBirth: Date | null;
                bankAccountName: string | null;
                bankName: string | null;
                bankAccountNumber: string | null;
                bankRoutingNumber: string | null;
                bankSwiftCode: string | null;
                bankIban: string | null;
                bankCountry: string | null;
                bankCurrency: string | null;
                payoutSetupCompleted: boolean;
                paypalEmail: string | null;
                stripeAccountId: string | null;
                payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
                policyStrikes: number;
                totalEarnings: number;
                totalViews: number;
                totalPurchases: number;
                waitlistBonus: number;
                bonusWithdrawn: boolean;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: import(".prisma/client").$Enums.PayoutRequestStatus;
            creatorId: string;
            requestedAmount: number;
            emailVerifiedAt: Date | null;
            kycVerifiedAt: Date | null;
            bankSetupAt: Date | null;
            reviewedBy: string | null;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            payoutId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPayoutRequestDetails(requestId: string): Promise<{
        success: boolean;
        data: {
            payout: {
                amount: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                status: string;
                creatorId: string;
                processedAt: Date | null;
                paymentMethod: string;
                paymentId: string | null;
                notes: string | null;
            } | null;
            creator: {
                user: {
                    email: string;
                    displayName: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                displayName: string;
                firstName: string | null;
                lastName: string | null;
                country: string | null;
                bio: string | null;
                profileImage: string | null;
                coverImage: string | null;
                allowBuyerProfileView: boolean;
                verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
                veriffSessionId: string | null;
                veriffDecisionId: string | null;
                verifiedAt: Date | null;
                verificationNotes: string | null;
                dateOfBirth: Date | null;
                bankAccountName: string | null;
                bankName: string | null;
                bankAccountNumber: string | null;
                bankRoutingNumber: string | null;
                bankSwiftCode: string | null;
                bankIban: string | null;
                bankCountry: string | null;
                bankCurrency: string | null;
                payoutSetupCompleted: boolean;
                paypalEmail: string | null;
                stripeAccountId: string | null;
                payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
                policyStrikes: number;
                totalEarnings: number;
                totalViews: number;
                totalPurchases: number;
                waitlistBonus: number;
                bonusWithdrawn: boolean;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: import(".prisma/client").$Enums.PayoutRequestStatus;
            creatorId: string;
            requestedAmount: number;
            emailVerifiedAt: Date | null;
            kycVerifiedAt: Date | null;
            bankSetupAt: Date | null;
            reviewedBy: string | null;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            payoutId: string | null;
        };
    }>;
    approvePayoutRequest(requestId: string, adminUserId: string, reviewNotes?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            request: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                status: import(".prisma/client").$Enums.PayoutRequestStatus;
                creatorId: string;
                requestedAmount: number;
                emailVerifiedAt: Date | null;
                kycVerifiedAt: Date | null;
                bankSetupAt: Date | null;
                reviewedBy: string | null;
                reviewedAt: Date | null;
                reviewNotes: string | null;
                payoutId: string | null;
            };
            payout: {
                amount: number;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                currency: string;
                status: string;
                creatorId: string;
                processedAt: Date | null;
                paymentMethod: string;
                paymentId: string | null;
                notes: string | null;
            };
        };
    }>;
    rejectPayoutRequest(requestId: string, adminUserId: string, reviewNotes: string): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            currency: string;
            status: import(".prisma/client").$Enums.PayoutRequestStatus;
            creatorId: string;
            requestedAmount: number;
            emailVerifiedAt: Date | null;
            kycVerifiedAt: Date | null;
            bankSetupAt: Date | null;
            reviewedBy: string | null;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            payoutId: string | null;
        };
    }>;
}
//# sourceMappingURL=payments.service.d.ts.map