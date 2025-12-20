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
}
//# sourceMappingURL=creators.service.d.ts.map