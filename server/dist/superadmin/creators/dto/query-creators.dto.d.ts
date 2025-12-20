export declare class QueryCreatorsDto {
    search?: string;
    kycStatus?: 'all' | 'VERIFIED' | 'PENDING' | 'REJECTED' | 'IN_PROGRESS';
    payoutStatus?: 'all' | 'ACTIVE' | 'ON_HOLD' | 'SUSPENDED';
    strikes?: 'all' | '0' | '1' | '2' | '3+';
    page?: number;
    limit?: number;
}
//# sourceMappingURL=query-creators.dto.d.ts.map