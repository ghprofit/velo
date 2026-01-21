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
            payoutStatus: string;
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
            payoutStatus: string;
            policyStrikes: number;
            recentContent: {
                id: string;
                title: string;
                status: import(".prisma/client").$Enums.ContentStatus;
                createdAt: Date;
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