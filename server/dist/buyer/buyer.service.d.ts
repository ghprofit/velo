import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class BuyerService {
    private prisma;
    private stripeService;
    private readonly logger;
    constructor(prisma: PrismaService, stripeService: StripeService);
    createOrGetSession(dto: CreateSessionDto, ipAddress?: string, userAgent?: string): Promise<{
        sessionToken: string;
        expiresAt: Date;
    }>;
    getContentDetails(contentId: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: number;
        thumbnailUrl: string;
        contentType: string;
        duration: number | null;
        viewCount: number;
        purchaseCount: number;
        creator: {
            id: string;
            displayName: string;
            profileImage: string | null;
            verificationStatus: import(".prisma/client").$Enums.VerificationStatus;
        };
    }>;
    createPurchase(dto: CreatePurchaseDto): Promise<{
        alreadyPurchased: boolean;
        accessToken: string;
        purchaseId?: undefined;
        clientSecret?: undefined;
        amount?: undefined;
    } | {
        purchaseId: string;
        clientSecret: string | null;
        amount: number;
        accessToken: string;
        alreadyPurchased?: undefined;
    }>;
    verifyPurchase(purchaseId: string): Promise<{
        id: string;
        status: string;
        accessToken: string;
        content: {
            id: string;
            title: string;
            contentType: string;
        };
    }>;
    getContentAccess(accessToken: string): Promise<{
        content: {
            id: string;
            title: string;
            description: string | null;
            contentType: string;
            s3Key: string;
            s3Bucket: string;
            thumbnailUrl: string;
            duration: number | null;
            creator: {
                displayName: string;
                profileImage: string | null;
            };
            contentItems: {
                id: string;
                s3Key: string;
                s3Bucket: string;
                order: number;
            }[];
        };
        purchase: {
            viewCount: number;
            purchasedAt: Date;
        };
    }>;
    getSessionPurchases(sessionToken: string): Promise<{
        id: string;
        accessToken: string;
        purchasedAt: Date;
        viewCount: number;
        content: {
            id: string;
            title: string;
            thumbnailUrl: string;
            contentType: string;
        };
    }[]>;
    confirmPurchase(purchaseId: string, paymentIntentId: string): Promise<{
        purchaseId: string;
        accessToken: string;
        status: string;
    }>;
}
//# sourceMappingURL=buyer.service.d.ts.map