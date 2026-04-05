import { PrismaService } from '../../prisma/prisma.service';
import { QueryCreatorsDto } from './dto/query-creators.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';
export declare class CreatorsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCreators(query: QueryCreatorsDto): Promise<{
        data: {
            id: any;
            name: any;
            email: any;
            kycStatus: any;
            payoutStatus: any;
            policyStrikes: any;
            lifetimeEarnings: any;
            lastLogin: string;
            isActive: any;
            createdAt: any;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCreatorById(id: string): Promise<{
        profile: {
            displayName: any;
            bio: any;
            profileImage: any;
            coverImage: any;
            firstName: any;
            lastName: any;
            dateOfBirth: any;
            country: any;
        };
        verification: {
            status: any;
            verifiedAt: any;
            notes: any;
        };
        payout: {
            status: any;
            paypalEmail: any;
            stripeAccountId: any;
        };
        stats: {
            totalEarnings: any;
            totalViews: any;
            totalPurchases: any;
            contentCount: any;
        };
        recentContent: any;
        recentPayouts: any;
        id: any;
        name: any;
        email: any;
        kycStatus: any;
        payoutStatus: any;
        policyStrikes: any;
        lifetimeEarnings: any;
        lastLogin: string;
        isActive: any;
        createdAt: any;
    }>;
    updateCreator(id: string, dto: UpdateCreatorDto): Promise<{
        id: any;
        name: any;
        email: any;
        kycStatus: any;
        payoutStatus: any;
        policyStrikes: any;
        lifetimeEarnings: any;
        lastLogin: string;
        isActive: any;
        createdAt: any;
    }>;
    addStrike(id: string, reason: string, adminId: string): Promise<{
        id: any;
        name: any;
        email: any;
        kycStatus: any;
        payoutStatus: any;
        policyStrikes: any;
        lifetimeEarnings: any;
        lastLogin: string;
        isActive: any;
        createdAt: any;
    }>;
    suspendCreator(id: string, reason: string, adminId: string): Promise<{
        id: any;
        name: any;
        email: any;
        kycStatus: any;
        payoutStatus: any;
        policyStrikes: any;
        lifetimeEarnings: any;
        lastLogin: string;
        isActive: any;
        createdAt: any;
    }>;
    reactivateCreator(id: string, adminId: string): Promise<{
        id: any;
        name: any;
        email: any;
        kycStatus: any;
        payoutStatus: any;
        policyStrikes: any;
        lifetimeEarnings: any;
        lastLogin: string;
        isActive: any;
        createdAt: any;
    }>;
    getCreatorStats(): Promise<{
        totalCreators: number;
        payoutOnHold: number;
        kycPendingOrFailed: number;
        highStrikes: number;
    }>;
    private formatCreatorResponse;
    private formatCreatorDetailResponse;
    private formatLastLogin;
}
//# sourceMappingURL=creators.service.d.ts.map