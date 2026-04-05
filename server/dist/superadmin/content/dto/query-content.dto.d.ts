export declare class QueryContentDto {
    search?: string;
    status?: 'all' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'REMOVED';
    complianceStatus?: 'all' | 'PENDING' | 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';
    contentType?: 'all' | 'VIDEO' | 'IMAGE' | 'GALLERY';
    severity?: 'all' | 'HIGH' | 'MEDIUM' | 'LOW';
    page?: number;
    limit?: number;
}
//# sourceMappingURL=query-content.dto.d.ts.map