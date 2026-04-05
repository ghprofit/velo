import { CreatorsService } from './creators.service';
import { SetupBankAccountDto } from './dto/bank-account.dto';
import { RequestPayoutDto } from './dto/request-payout.dto';
export declare class CreatorsController {
    private readonly creatorsService;
    private readonly logger;
    constructor(creatorsService: CreatorsService);
    initiateVerification(req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            sessionId: string;
            verificationUrl: string;
            status: string | undefined;
        };
    }>;
    getVerificationStatus(req: any): Promise<{
        success: boolean;
        data: {
            verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
            veriffSessionId: string | null;
            verifiedAt: Date | null;
            emailVerified: boolean;
        };
    }>;
    setupBankAccount(req: any, bankAccountDto: SetupBankAccountDto): Promise<{
        success: boolean;
        message: string;
        data: import("./dto/bank-account.dto").BankAccountResponseDto;
    }>;
    getBankAccount(req: any): Promise<{
        success: boolean;
        data: import("./dto/bank-account.dto").BankAccountResponseDto | null;
    }>;
    deleteBankAccount(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    requestPayout(req: any, requestPayoutDto: RequestPayoutDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            requestedAmount: number;
            availableBalance: number;
            currency: string;
            status: import(".prisma/client").$Enums.PayoutRequestStatus;
            createdAt: Date;
        };
    }>;
    getPayoutRequests(req: any): Promise<{
        success: boolean;
        data: {
            id: string;
            requestedAmount: number;
            availableBalance: number;
            currency: string;
            status: import(".prisma/client").$Enums.PayoutRequestStatus;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            createdAt: Date;
            payout: {
                amount: number;
                id: string;
                status: string;
                processedAt: Date | null;
                paymentId: string | null;
            } | null;
        }[];
    }>;
    getPayoutRequestById(req: any, requestId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            requestedAmount: number;
            availableBalance: number;
            currency: string;
            status: import(".prisma/client").$Enums.PayoutRequestStatus;
            emailVerifiedAt: Date | null;
            kycVerifiedAt: Date | null;
            bankSetupAt: Date | null;
            reviewedBy: string | null;
            reviewedAt: Date | null;
            reviewNotes: string | null;
            createdAt: Date;
            updatedAt: Date;
            payout: {
                amount: number;
                id: string;
                status: string;
                processedAt: Date | null;
                paymentId: string | null;
                notes: string | null;
            } | null;
        };
    }>;
    getStripeOnboardingLink(req: any): Promise<{
        success: boolean;
        data: {
            url: string;
            expiresAt: Date;
        };
    }>;
    getStripeAccountStatus(req: any): Promise<{
        success: boolean;
        data: {
            hasAccount: boolean;
            onboardingComplete: boolean;
            chargesEnabled: boolean;
            payoutsEnabled: boolean;
            requiresAction?: undefined;
            accountId?: undefined;
        } | {
            hasAccount: boolean;
            onboardingComplete: boolean;
            chargesEnabled: boolean;
            payoutsEnabled: boolean;
            requiresAction: boolean;
            accountId: string;
        };
    }>;
}
//# sourceMappingURL=creators.controller.d.ts.map