import { Request } from 'express';
import { BuyerService } from './buyer.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { VerifyAccessDto } from './dto/verify-access.dto';
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto';
export declare class BuyerController {
    private readonly buyerService;
    constructor(buyerService: BuyerService);
    createSession(dto: CreateSessionDto, ipAddress: string, req: Request): Promise<{
        sessionToken: string;
        expiresAt: Date;
    }>;
    getContentDetails(id: string): Promise<{
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
    verifyPurchase(id: string): Promise<{
        id: string;
        status: string;
        accessToken: string;
        content: {
            id: string;
            title: string;
            contentType: string;
        };
    }>;
    getContentAccess(dto: VerifyAccessDto): Promise<{
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
    confirmPurchase(dto: ConfirmPurchaseDto): Promise<{
        purchaseId: string;
        accessToken: string;
        status: string;
    }>;
}
//# sourceMappingURL=buyer.controller.d.ts.map