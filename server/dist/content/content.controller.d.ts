import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
export declare class ContentController {
    private contentService;
    constructor(contentService: ContentService);
    createContent(req: any, createContentDto: CreateContentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                creator: {
                    user: {
                        displayName: string | null;
                        profilePicture: string | null;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    displayName: string;
                    firstName: string | null;
                    lastName: string | null;
                    country: string | null;
                    bio: string | null;
                    profileImage: string | null;
                    coverImage: string | null;
                    verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
                    veriffSessionId: string | null;
                    veriffDecisionId: string | null;
                    verifiedAt: Date | null;
                    verificationNotes: string | null;
                    dateOfBirth: Date | null;
                    bankAccountName: string | null;
                    bankName: string | null;
                    bankAccountNumber: string | null;
                    bankRoutingNumber: string | null;
                    bankSwiftCode: string | null;
                    bankIban: string | null;
                    bankCountry: string | null;
                    bankCurrency: string | null;
                    payoutSetupCompleted: boolean;
                    totalEarnings: number;
                    totalViews: number;
                    totalPurchases: number;
                    userId: string;
                };
                contentItems: {
                    id: string;
                    createdAt: Date;
                    contentId: string;
                    s3Key: string;
                    s3Bucket: string;
                    fileSize: number;
                    order: number;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                status: import(".prisma/client").$Enums.ContentStatus;
                viewCount: number;
                creatorId: string;
                title: string;
                price: number;
                thumbnailUrl: string;
                contentType: string;
                s3Key: string;
                s3Bucket: string;
                fileSize: number;
                duration: number | null;
                isPublished: boolean;
                publishedAt: Date | null;
                complianceStatus: import(".prisma/client").$Enums.ComplianceCheckStatus;
                complianceCheckedAt: Date | null;
                complianceNotes: string | null;
                purchaseCount: number;
                totalRevenue: number;
            };
            link: string;
            shortId: string;
        };
    }>;
    getMyContent(req: any): Promise<{
        success: boolean;
        data: ({
            _count: {
                purchases: number;
            };
            contentItems: {
                id: string;
                createdAt: Date;
                contentId: string;
                s3Key: string;
                s3Bucket: string;
                fileSize: number;
                order: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.ContentStatus;
            viewCount: number;
            creatorId: string;
            title: string;
            price: number;
            thumbnailUrl: string;
            contentType: string;
            s3Key: string;
            s3Bucket: string;
            fileSize: number;
            duration: number | null;
            isPublished: boolean;
            publishedAt: Date | null;
            complianceStatus: import(".prisma/client").$Enums.ComplianceCheckStatus;
            complianceCheckedAt: Date | null;
            complianceNotes: string | null;
            purchaseCount: number;
            totalRevenue: number;
        })[];
    }>;
    getContentStats(req: any): Promise<{
        success: boolean;
        data: {
            totalContent: number;
            totalViews: number;
            totalPurchases: number;
            totalRevenue: number;
        };
    }>;
    getContentById(id: string): Promise<{
        success: boolean;
        data: {
            creator: {
                user: {
                    displayName: string | null;
                    profilePicture: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                displayName: string;
                firstName: string | null;
                lastName: string | null;
                country: string | null;
                bio: string | null;
                profileImage: string | null;
                coverImage: string | null;
                verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
                veriffSessionId: string | null;
                veriffDecisionId: string | null;
                verifiedAt: Date | null;
                verificationNotes: string | null;
                dateOfBirth: Date | null;
                bankAccountName: string | null;
                bankName: string | null;
                bankAccountNumber: string | null;
                bankRoutingNumber: string | null;
                bankSwiftCode: string | null;
                bankIban: string | null;
                bankCountry: string | null;
                bankCurrency: string | null;
                payoutSetupCompleted: boolean;
                totalEarnings: number;
                totalViews: number;
                totalPurchases: number;
                userId: string;
            };
            contentItems: {
                id: string;
                createdAt: Date;
                contentId: string;
                s3Key: string;
                s3Bucket: string;
                fileSize: number;
                order: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            status: import(".prisma/client").$Enums.ContentStatus;
            viewCount: number;
            creatorId: string;
            title: string;
            price: number;
            thumbnailUrl: string;
            contentType: string;
            s3Key: string;
            s3Bucket: string;
            fileSize: number;
            duration: number | null;
            isPublished: boolean;
            publishedAt: Date | null;
            complianceStatus: import(".prisma/client").$Enums.ComplianceCheckStatus;
            complianceCheckedAt: Date | null;
            complianceNotes: string | null;
            purchaseCount: number;
            totalRevenue: number;
        };
    }>;
    deleteContent(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=content.controller.d.ts.map