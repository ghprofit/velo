import { ContentService } from './content.service';
import { QueryContentDto, ReviewContentDto } from './dto/content.dto';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
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
        data: import("./dto/content.dto").ContentStatsDto;
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
    flagContent(id: string, body: {
        reason: string;
    }): Promise<{
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
    removeContent(id: string, body: {
        reason: string;
    }): Promise<{
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
//# sourceMappingURL=content.controller.d.ts.map