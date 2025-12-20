import { CreatorsService } from './creators.service';
import { QueryCreatorsDto } from './dto/creators.dto';
export declare class CreatorsController {
    private readonly creatorsService;
    constructor(creatorsService: CreatorsService);
    getCreators(query: QueryCreatorsDto): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string;
            kycStatus: import(".prisma/client").$Enums.VerificationStatus;
            accountStatus: string;
            joinDate: string;
            lastLogin: string | null;
            isActive: boolean;
            totalEarnings: number;
            totalViews: number;
            totalPurchases: number;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCreatorStats(): Promise<{
        success: boolean;
        data: import("./dto/creators.dto").CreatorStatsDto;
    }>;
    getCreatorById(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            name: string;
            email: string;
            bio: string | null;
            profileImage: string | null;
            coverImage: string | null;
            kycStatus: import(".prisma/client").$Enums.VerificationStatus;
            accountStatus: string;
            joinDate: string;
            lastLogin: string | null;
            totalEarnings: number;
            totalViews: number;
            totalPurchases: number;
            payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
            policyStrikes: number;
            recentContent: {
                id: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.ContentStatus;
                title: string;
            }[];
            recentPayouts: {
                amount: number;
                id: string;
                createdAt: Date;
                status: string;
            }[];
        };
        message?: undefined;
    }>;
}
//# sourceMappingURL=creators.controller.d.ts.map