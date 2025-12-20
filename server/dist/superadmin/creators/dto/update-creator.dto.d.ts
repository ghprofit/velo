export declare enum PayoutStatusDto {
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    SUSPENDED = "SUSPENDED"
}
export declare enum VerificationStatusDto {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare class UpdateCreatorDto {
    displayName?: string;
    payoutStatus?: PayoutStatusDto;
    verificationStatus?: VerificationStatusDto;
    policyStrikes?: number;
    verificationNotes?: string;
}
export declare class AddStrikeDto {
    reason: string;
}
export declare class SuspendCreatorDto {
    reason: string;
}
//# sourceMappingURL=update-creator.dto.d.ts.map