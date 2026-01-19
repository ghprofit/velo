import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { CreateContentMultipartDto } from './dto/create-content-multipart.dto';
import { GetUploadUrlDto } from './dto/get-upload-url.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
export declare class ContentController {
    private contentService;
    private readonly logger;
    constructor(contentService: ContentService);
    getUploadUrls(req: any, dto: GetUploadUrlDto): Promise<{
        success: boolean;
        data: {
            contentId: string;
            thumbnailUrl: {
                uploadUrl: string;
                key: string;
            };
            contentUrls: {
                uploadUrl: string;
                key: string;
                index: number;
                originalFileName: string;
            }[];
            metadata: {
                title: string;
                description: string;
                category: string | undefined;
                price: number;
            };
        };
    }>;
    confirmUpload(req: any, dto: ConfirmUploadDto): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                creator: {
                    user: {
                        email: string;
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
                    allowBuyerProfileView: boolean;
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
                    paypalEmail: string | null;
                    stripeAccountId: string | null;
                    payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
                    policyStrikes: number;
                    totalEarnings: number;
                    totalViews: number;
                    totalPurchases: number;
                    waitlistBonus: number;
                    bonusWithdrawn: boolean;
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
                status: import(".prisma/client").$Enums.ContentStatus;
                viewCount: number;
                creatorId: string;
                title: string;
                description: string | null;
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
                scheduledReviewAt: Date | null;
                rekognitionJobId: string | null;
                rekognitionJobStatus: string | null;
                rekognitionJobStartedAt: Date | null;
                rekognitionJobCompletedAt: Date | null;
                moderationCheckType: string | null;
                purchaseCount: number;
                totalRevenue: number;
            };
            link: string;
            shortId: string;
            status: string;
        };
    }>;
    createContent(req: any, createContentDto: CreateContentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                creator: {
                    user: {
                        email: string;
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
                    allowBuyerProfileView: boolean;
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
                    paypalEmail: string | null;
                    stripeAccountId: string | null;
                    payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
                    policyStrikes: number;
                    totalEarnings: number;
                    totalViews: number;
                    totalPurchases: number;
                    waitlistBonus: number;
                    bonusWithdrawn: boolean;
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
                status: import(".prisma/client").$Enums.ContentStatus;
                viewCount: number;
                creatorId: string;
                title: string;
                description: string | null;
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
                scheduledReviewAt: Date | null;
                rekognitionJobId: string | null;
                rekognitionJobStatus: string | null;
                rekognitionJobStartedAt: Date | null;
                rekognitionJobCompletedAt: Date | null;
                moderationCheckType: string | null;
                purchaseCount: number;
                totalRevenue: number;
            };
            link: string;
            shortId: string;
            status: "PENDING_REVIEW";
        };
    }>;
    createContentMultipart(req: any, createContentDto: CreateContentMultipartDto, uploadedFiles: {
        files?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            content: {
                creator: {
                    user: {
                        id: string;
                        email: string;
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
                    allowBuyerProfileView: boolean;
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
                    paypalEmail: string | null;
                    stripeAccountId: string | null;
                    payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
                    policyStrikes: number;
                    totalEarnings: number;
                    totalViews: number;
                    totalPurchases: number;
                    waitlistBonus: number;
                    bonusWithdrawn: boolean;
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
                status: import(".prisma/client").$Enums.ContentStatus;
                viewCount: number;
                creatorId: string;
                title: string;
                description: string | null;
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
                scheduledReviewAt: Date | null;
                rekognitionJobId: string | null;
                rekognitionJobStatus: string | null;
                rekognitionJobStartedAt: Date | null;
                rekognitionJobCompletedAt: Date | null;
                moderationCheckType: string | null;
                purchaseCount: number;
                totalRevenue: number;
            };
            shortId: string;
            status: "PENDING_REVIEW";
            message: string;
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
            status: import(".prisma/client").$Enums.ContentStatus;
            viewCount: number;
            creatorId: string;
            title: string;
            description: string | null;
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
            scheduledReviewAt: Date | null;
            rekognitionJobId: string | null;
            rekognitionJobStatus: string | null;
            rekognitionJobStartedAt: Date | null;
            rekognitionJobCompletedAt: Date | null;
            moderationCheckType: string | null;
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
                allowBuyerProfileView: boolean;
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
                paypalEmail: string | null;
                stripeAccountId: string | null;
                payoutStatus: import(".prisma/client").$Enums.PayoutStatus;
                policyStrikes: number;
                totalEarnings: number;
                totalViews: number;
                totalPurchases: number;
                waitlistBonus: number;
                bonusWithdrawn: boolean;
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
            status: import(".prisma/client").$Enums.ContentStatus;
            viewCount: number;
            creatorId: string;
            title: string;
            description: string | null;
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
            scheduledReviewAt: Date | null;
            rekognitionJobId: string | null;
            rekognitionJobStatus: string | null;
            rekognitionJobStartedAt: Date | null;
            rekognitionJobCompletedAt: Date | null;
            moderationCheckType: string | null;
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