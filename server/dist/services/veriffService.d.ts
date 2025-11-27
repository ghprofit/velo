export interface VeriffSessionData {
    verification: {
        id: string;
        url: string;
        vendorData?: string;
        host?: string;
        status: string;
        sessionToken?: string;
    };
}
export interface VeriffWebhookEvent {
    id: string;
    feature: string;
    code: number;
    action: string;
    vendorData?: string;
}
export interface VeriffDecisionData {
    verification: {
        id: string;
        code: number;
        person?: {
            firstName?: string;
            lastName?: string;
            dateOfBirth?: string;
            nationality?: string;
        };
        document?: {
            number?: string;
            type?: string;
            country?: string;
        };
        status: string;
        decisionTime?: string;
    };
}
export declare function createVerificationSession(userId: string, callback: string): Promise<VeriffSessionData>;
export declare function getVerificationDecision(sessionId: string): Promise<VeriffDecisionData>;
export declare function verifyWebhookSignature(payload: string, signature: string): boolean;
export declare function parseVerificationStatus(code: number): 'VERIFIED' | 'REJECTED' | 'PENDING' | 'EXPIRED';
export declare function getVerificationStatusMessage(status: string): string;
//# sourceMappingURL=veriffService.d.ts.map