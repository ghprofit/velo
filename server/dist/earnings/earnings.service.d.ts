import { PrismaService } from '../prisma/prisma.service';
export interface BalanceResponse {
    lifetimeEarnings: number;
    pendingBalance: number;
    availableBalance: number;
    totalPayouts: number;
    currency: string;
    lockedBonus?: number;
    salesToUnlock?: number;
}
export interface Transaction {
    id: string;
    type: 'purchase' | 'payout';
    amount: number;
    currency: string;
    status: string;
    date: Date;
    description: string;
    contentTitle?: string;
    buyerSessionId?: string;
    paymentMethod?: string;
}
export interface PaginatedTransactions {
    transactions: Transaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface PaginatedPayouts {
    payouts: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class EarningsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getCreatorProfile;
    getBalance(userId: string): Promise<BalanceResponse>;
    getPayouts(userId: string, page?: number, limit?: number): Promise<PaginatedPayouts>;
    getTransactions(userId: string, page?: number, limit?: number, type?: 'purchase' | 'payout', search?: string): Promise<PaginatedTransactions>;
}
//# sourceMappingURL=earnings.service.d.ts.map