import { ConfigService } from '@nestjs/config';
export declare class PaystackService {
    private config;
    private readonly logger;
    private readonly secretKey;
    private readonly apiBase;
    constructor(config: ConfigService);
    isConfigured(): boolean;
    private getAuthHeaders;
    initializeTransaction(email: string, amount: number, callbackUrl: string, metadata?: Record<string, string>): Promise<{
        authorizationUrl: string;
        reference: string;
    }>;
    verifyTransaction(reference: string): Promise<{
        status: string;
        amount: number;
        currency: string;
        paidAt: string;
        customerEmail: string;
    }>;
}
//# sourceMappingURL=paystack.service.d.ts.map