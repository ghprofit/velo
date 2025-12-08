export declare class CreateSessionDto {
    verification: {
        callback?: string;
        person: {
            firstName?: string;
            lastName?: string;
            idNumber?: string;
            dateOfBirth?: string;
        };
        document?: {
            number?: string;
            type?: string;
            country?: string;
        };
        vendorData?: string;
    };
    timestamp?: string;
}
//# sourceMappingURL=create-session.dto.d.ts.map