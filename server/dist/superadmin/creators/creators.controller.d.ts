import { CreatorsService } from './creators.service';
import { QueryCreatorsDto } from './dto/query-creators.dto';
import { UpdateCreatorDto, AddStrikeDto, SuspendCreatorDto } from './dto/update-creator.dto';
export declare class CreatorsController {
    private readonly creatorsService;
    constructor(creatorsService: CreatorsService);
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
        success: boolean;
    }>;
    getCreatorStats(): Promise<{
        success: boolean;
        data: {
            totalCreators: number;
            payoutOnHold: number;
            kycPendingOrFailed: number;
            highStrikes: number;
        };
    }>;
    getCreatorById(id: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateCreator(id: string, dto: UpdateCreatorDto): Promise<{
        success: boolean;
        message: string;
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
        };
    }>;
    addStrike(id: string, dto: AddStrikeDto, req: any): Promise<{
        success: boolean;
        message: string;
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
        };
    }>;
    suspendCreator(id: string, dto: SuspendCreatorDto, req: any): Promise<{
        success: boolean;
        message: string;
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
        };
    }>;
    reactivateCreator(id: string, req: any): Promise<{
        success: boolean;
        message: string;
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
        };
    }>;
}
//# sourceMappingURL=creators.controller.d.ts.map