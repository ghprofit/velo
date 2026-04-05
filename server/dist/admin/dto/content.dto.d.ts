export declare class QueryContentDto {
    search?: string;
    status?: string;
    creatorId?: string;
    page?: number;
    limit?: number;
}
export declare class ReviewContentDto {
    status: 'APPROVED' | 'REJECTED';
    reason?: string;
}
export declare class ContentStatsDto {
    totalContent: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    flagged: number;
}
//# sourceMappingURL=content.dto.d.ts.map