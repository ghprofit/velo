import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { QueryContentDto, ReviewContentDto, ContentStatsDto } from './dto/content.dto';
export declare class ContentService {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
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