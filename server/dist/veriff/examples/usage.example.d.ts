import { VeriffService } from '../veriff.service';
export declare class VeriffUsageExample {
    private readonly veriffService;
    private readonly logger;
    constructor(veriffService: VeriffService);
    createVerificationSession(userId: string, userDetails: any): Promise<{
        sessionId: string;
        verificationUrl: string;
        status: string | undefined;
    }>;
    createSessionWithDocumentInfo(userId: string, userDetails: any): Promise<{
        sessionId: string;
        verificationUrl: string;
    }>;
    checkVerificationStatus(sessionId: string): Promise<{
        approved: boolean;
        person: {
            firstName: string | undefined;
            lastName: string | undefined;
            dateOfBirth: string | undefined;
            nationality: string | undefined;
            gender: string | undefined;
        };
        document: {
            number: string | undefined;
            type: string | undefined;
            country: string | undefined;
            validFrom: string | undefined;
            validUntil: string | undefined;
        };
        reason?: undefined;
        reasonCode?: undefined;
        resubmissionRequired?: undefined;
        status?: undefined;
        code?: undefined;
    } | {
        approved: boolean;
        reason: string | undefined;
        reasonCode: number | undefined;
        person?: undefined;
        document?: undefined;
        resubmissionRequired?: undefined;
        status?: undefined;
        code?: undefined;
    } | {
        resubmissionRequired: boolean;
        reason: string | undefined;
        approved?: undefined;
        person?: undefined;
        document?: undefined;
        reasonCode?: undefined;
        status?: undefined;
        code?: undefined;
    } | {
        status: string | undefined;
        code: number;
        approved?: undefined;
        person?: undefined;
        document?: undefined;
        reason?: undefined;
        reasonCode?: undefined;
        resubmissionRequired?: undefined;
    }>;
    getSessionMedia(sessionId: string): Promise<any>;
    handleResubmission(sessionId: string, updatedData?: any): Promise<{
        sessionId: string;
        verificationUrl: string;
    }>;
    cancelVerification(sessionId: string): Promise<{
        canceled: boolean;
        sessionId: string;
    }>;
    completeUserOnboarding(userId: string, userDetails: any): Promise<{
        success: boolean;
        message: string;
        verificationUrl: string;
    }>;
    processWebhookDecision(webhookData: any): Promise<{
        processed: boolean;
        sessionId: any;
        status: any;
    }>;
}
//# sourceMappingURL=usage.example.d.ts.map