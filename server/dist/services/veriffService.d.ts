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
/**
 * Create a Veriff verification session
 */
export declare function createVerificationSession(userId: string, callback: string): Promise<VeriffSessionData>;
/**
 * Get verification decision from Veriff
 */
export declare function getVerificationDecision(sessionId: string): Promise<VeriffDecisionData>;
/**
 * Verify Veriff webhook signature
 */
export declare function verifyWebhookSignature(payload: string, signature: string): boolean;
/**
 * Parse Veriff verification status
 */
export declare function parseVerificationStatus(code: number): 'VERIFIED' | 'REJECTED' | 'PENDING' | 'EXPIRED';
/**
 * Get human-readable verification status message
 */
export declare function getVerificationStatusMessage(status: string): string;
//# sourceMappingURL=veriffService.d.ts.map