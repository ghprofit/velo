import { PrismaService } from '../prisma/prisma.service';
import { VeriffService } from '../veriff/veriff.service';
import { SetupBankAccountDto, BankAccountResponseDto } from './dto/bank-account.dto';
export declare class CreatorsService {
    private readonly prisma;
    private readonly veriffService;
    private readonly logger;
    constructor(prisma: PrismaService, veriffService: VeriffService);
    initiateVerification(userId: string): Promise<{
        sessionId: string;
        verificationUrl: string;
        status: string | undefined;
    }>;
    getMyVerificationStatus(userId: string): Promise<{
        verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
        veriffSessionId: string | null;
        verifiedAt: Date | null;
    }>;
    processVeriffWebhook(sessionId: string, status: string, code: number, vendorData?: string): Promise<void>;
    setupBankAccount(userId: string, bankAccountDto: SetupBankAccountDto): Promise<BankAccountResponseDto>;
    getBankAccount(userId: string): Promise<BankAccountResponseDto | null>;
    requestPayout(userId: string, requestedAmount: number): Promise<{
        id: string;
        requestedAmount: number;
        availableBalance: number;
        currency: string;
        status: import(".prisma/client").$Enums.PayoutRequestStatus;
        createdAt: Date;
        message: string;
    }>;
    getPayoutRequests(userId: string): Promise<{
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
            paymentId: string | null;
            processedAt: Date | null;
        } | null;
    }[]>;
    getPayoutRequestById(userId: string, requestId: string): Promise<{
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
            paymentId: string | null;
            processedAt: Date | null;
            notes: string | null;
        } | null;
    }>;
}
//# sourceMappingURL=creators.service.d.ts.map