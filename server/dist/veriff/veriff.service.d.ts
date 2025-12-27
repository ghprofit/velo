import { CreateSessionDto, SessionResponseDto, VerificationStatusDto } from './dto';
import type { VeriffModuleOptions } from './interfaces/veriff-config.interface';
export declare class VeriffService {
    private readonly options;
    private readonly logger;
    private readonly axiosInstance;
    private readonly apiKey;
    private readonly apiSecret;
    private readonly webhookSecret;
    constructor(options: VeriffModuleOptions);
    private setupInterceptors;
    private generateSignature;
    private generateSignatureFromString;
    verifyWebhookSignature(payload: string, signature: string): boolean;
    private handleApiError;
    createSession(createSessionDto: CreateSessionDto): Promise<SessionResponseDto>;
    getVerificationStatus(sessionId: string): Promise<VerificationStatusDto>;
    getSessionMedia(sessionId: string): Promise<any>;
    resubmitSession(sessionId: string, updateData?: Partial<CreateSessionDto>): Promise<SessionResponseDto>;
    cancelSession(sessionId: string): Promise<void>;
    isVerificationApproved(verificationStatus: VerificationStatusDto): boolean;
    isResubmissionRequired(verificationStatus: VerificationStatusDto): boolean;
    isVerificationDeclined(verificationStatus: VerificationStatusDto): boolean;
}
//# sourceMappingURL=veriff.service.d.ts.map