import { TwofactorService } from './twofactor.service';
import { Setup2FADto, Setup2FAResponseDto, Verify2FADto, Verify2FAResponseDto, Enable2FADto, Enable2FAResponseDto, Disable2FADto, Disable2FAResponseDto } from './dto';
export declare class TwofactorController {
    private readonly twofactorService;
    private readonly logger;
    constructor(twofactorService: TwofactorService);
    setup2FA(setupDto: Setup2FADto): Promise<Setup2FAResponseDto>;
    enable2FA(enableDto: Enable2FADto): Promise<Enable2FAResponseDto>;
    verify2FA(verifyDto: Verify2FADto): Promise<Verify2FAResponseDto>;
    disable2FA(disableDto: Disable2FADto): Promise<Disable2FAResponseDto>;
    get2FAStatus(userId: string): {
        remainingBackupCodes: Promise<number>;
        then<TResult1 = {
            enabled: boolean;
            hasSecret: boolean;
        }, TResult2 = never>(onfulfilled?: ((value: {
            enabled: boolean;
            hasSecret: boolean;
        }) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2>;
        catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<{
            enabled: boolean;
            hasSecret: boolean;
        } | TResult>;
        finally(onfinally?: (() => void) | null | undefined): Promise<{
            enabled: boolean;
            hasSecret: boolean;
        }>;
        [Symbol.toStringTag]: string;
    };
    verifyBackupCode(body: {
        userId: string;
        backupCode: string;
    }): Promise<Verify2FAResponseDto>;
    regenerateBackupCodes(body: {
        userId: string;
        token: string;
    }): Promise<{
        backupCodes: string[];
        message: string;
    }>;
    generateToken(userId: string): {
        userId: string;
        token: Promise<string>;
        message: string;
        expiresIn: string;
    };
    healthCheck(): {
        status: string;
        service: string;
        timestamp: string;
    };
    clearAll(): {
        message: string;
    };
}
//# sourceMappingURL=twofactor.controller.d.ts.map