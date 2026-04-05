import { EarningsService } from './earnings.service';
interface AuthenticatedRequest {
    user: {
        id: string;
        email: string;
        role: string;
    };
}
export declare class EarningsController {
    private readonly earningsService;
    constructor(earningsService: EarningsService);
    getBalance(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: import("./earnings.service").BalanceResponse;
    }>;
    getPayouts(req: AuthenticatedRequest, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            payouts: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
    getTransactions(req: AuthenticatedRequest, page?: number, limit?: number, type?: 'purchase' | 'payout', search?: string): Promise<{
        success: boolean;
        data: {
            transactions: import("./earnings.service").Transaction[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>;
}
export {};
//# sourceMappingURL=earnings.controller.d.ts.map