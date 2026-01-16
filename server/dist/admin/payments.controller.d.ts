import { PaymentsService } from './payments.service';
import { QueryPaymentsDto, QueryPayoutsDto, ProcessPayoutDto } from './dto/payments.dto';
import { ApprovePayoutRequestDto, RejectPayoutRequestDto } from './dto/approve-payout-request.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getPaymentStats(): Promise<import("./dto/payments.dto").PaymentStatsDto>;
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
    processPayout(body: ProcessPayoutDto): Promise<{
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
            processedAt: Date | null;
            paymentMethod: string;
            paymentId: string | null;
            notes: string | null;
        };
    }>;
    getRevenueChart(period: 'weekly' | 'monthly' | 'yearly'): Promise<import("./dto/payments.dto").RevenueChartDto[]>;
    getPayoutRequests(status?: string, creatorId?: string, page?: number, limit?: number): Promise<{
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
    getPayoutRequestDetails(id: string): Promise<{
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
    approvePayoutRequest(req: any, dto: ApprovePayoutRequestDto): Promise<{
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
    rejectPayoutRequest(req: any, dto: RejectPayoutRequestDto): Promise<{
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
//# sourceMappingURL=payments.controller.d.ts.map