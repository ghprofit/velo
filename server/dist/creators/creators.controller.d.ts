import { CreatorsService } from './creators.service';
import { SetupBankAccountDto } from './dto/bank-account.dto';
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
}
//# sourceMappingURL=creators.controller.d.ts.map