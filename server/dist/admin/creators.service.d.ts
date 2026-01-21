import { PrismaService } from '../prisma/prisma.service';
import { QueryCreatorsDto, CreatorStatsDto } from './dto/creators.dto';
export declare class CreatorsService {
    private prisma;
    constructor(prisma: PrismaService);
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
        data: CreatorStatsDto;
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
//# sourceMappingURL=creators.service.d.ts.map