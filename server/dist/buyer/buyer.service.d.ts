import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { S3Service } from '../s3/s3.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
export declare class BuyerService {
    private prisma;
    private stripeService;
    private emailService;
    private s3Service;
    private readonly logger;
    private readonly MAX_TRUSTED_DEVICES;
    private readonly ACCESS_WINDOW_HOURS;
    private readonly VERIFICATION_CODE_EXPIRY_MINUTES;
    constructor(prisma: PrismaService, stripeService: StripeService, emailService: EmailService, s3Service: S3Service);
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
    createPurchase(dto: CreatePurchaseDto, ipAddress?: string): Promise<{
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
    getContentAccess(accessToken: string, fingerprint: string, ipAddress?: string): Promise<{
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
                signedUrl: string;
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
    checkAccessEligibility(accessToken: string, fingerprint: string): Promise<{
        hasAccess: boolean;
        reason: string;
        isExpired?: undefined;
        needsEmailVerification?: undefined;
        canAddMoreDevices?: undefined;
        accessExpiresAt?: undefined;
        timeRemaining?: undefined;
    } | {
        hasAccess: boolean;
        isExpired: boolean;
        reason: string;
        needsEmailVerification?: undefined;
        canAddMoreDevices?: undefined;
        accessExpiresAt?: undefined;
        timeRemaining?: undefined;
    } | {
        hasAccess: boolean;
        needsEmailVerification: boolean;
        reason: string;
        canAddMoreDevices: boolean;
        isExpired?: undefined;
        accessExpiresAt?: undefined;
        timeRemaining?: undefined;
    } | {
        hasAccess: boolean;
        accessExpiresAt: Date | null;
        timeRemaining: number | null;
        reason?: undefined;
        isExpired?: undefined;
        needsEmailVerification?: undefined;
        canAddMoreDevices?: undefined;
    }>;
    requestDeviceVerification(accessToken: string, fingerprint: string, email: string): Promise<{
        success: boolean;
    }>;
    verifyDeviceCode(accessToken: string, fingerprint: string, verificationCode: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=buyer.service.d.ts.map