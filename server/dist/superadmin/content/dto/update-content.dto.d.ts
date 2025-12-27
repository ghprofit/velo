export declare class UpdateContentDto {
    status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'REMOVED';
    complianceStatus?: 'PENDING' | 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';
    complianceNotes?: string;
    isPublished?: boolean;
}
export declare class ReviewContentDto {
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED';
    notes?: string;
    reason?: string;
}
export declare class RemoveContentDto {
    reason: string;
    notifyCreator?: boolean;
}
//# sourceMappingURL=update-content.dto.d.ts.map