import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { S3Service } from '../s3/s3.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QueryContentDto, ReviewContentDto, ContentStatsDto } from './dto/content.dto';
export declare class ContentService {
    private prisma;
    private emailService;
    private s3Service;
    private notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService, s3Service: S3Service, notificationsService: NotificationsService);
    getContent(query: QueryContentDto): Promise<{
        success: boolean;
        data: {
            id: string;
            title: string;
            description: string | null;
            status: import(".prisma/client").$Enums.ContentStatus;
            price: number;
            mediaType: string;
            createdAt: string;
            updatedAt: string;
            creator: {
                id: string;
                name: string;
                email: string;
            };
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getContentStats(): Promise<{
        success: boolean;
        data: ContentStatsDto;
    }>;
    getContentById(id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            title: string;
            description: string | null;
            status: import(".prisma/client").$Enums.ContentStatus;
            price: number;
            mediaType: string;
            s3Key: string;
            s3Bucket: string;
            thumbnailUrl: string;
            signedUrl: string | undefined;
            contentItems: {
                id: string;
                s3Key: string;
                s3Bucket: string;
                fileSize: number;
                order: number;
                signedUrl: string | undefined;
            }[];
            createdAt: string;
            updatedAt: string;
            creator: {
                id: string;
                name: string;
                email: string;
            };
            recentPurchases: {
                amount: number;
                id: string;
                createdAt: Date;
            }[];
        };
        message?: undefined;
    }>;
    reviewContent(id: string, dto: ReviewContentDto): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            id: string;
            status: import(".prisma/client").$Enums.ContentStatus;
        };
    }>;
    flagContent(id: string, reason: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            id: string;
            status: import(".prisma/client").$Enums.ContentStatus;
        };
    }>;
    removeContent(id: string, reason: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            id: string;
            status: import(".prisma/client").$Enums.ContentStatus;
        };
    }>;
}
//# sourceMappingURL=content.service.d.ts.map