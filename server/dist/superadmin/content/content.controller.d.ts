import { ContentService } from './content.service';
import { QueryContentDto } from './dto/query-content.dto';
import { UpdateContentDto, ReviewContentDto, RemoveContentDto } from './dto/update-content.dto';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getContent(query: QueryContentDto): Promise<{
        data: {
            id: any;
            title: any;
            description: any;
            creatorName: any;
            creatorId: any;
            contentType: any;
            thumbnailUrl: any;
            price: any;
            status: any;
            complianceStatus: any;
            complianceNotes: any;
            isPublished: any;
            viewCount: any;
            purchaseCount: any;
            totalRevenue: any;
            createdAt: any;
            publishedAt: any;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        success: boolean;
    }>;
    getContentStats(): Promise<{
        success: boolean;
        data: {
            totalContent: number;
            pendingReview: number;
            flagged: number;
            approved: number;
            rejected: number;
            highSeverity: number;
        };
    }>;
    getContentById(id: string): Promise<{
        success: boolean;
        data: {
            creatorEmail: any;
            fileSize: any;
            duration: any;
            s3Key: any;
            complianceLogs: any;
            contentItems: any;
            id: any;
            title: any;
            description: any;
            creatorName: any;
            creatorId: any;
            contentType: any;
            thumbnailUrl: any;
            price: any;
            status: any;
            complianceStatus: any;
            complianceNotes: any;
            isPublished: any;
            viewCount: any;
            purchaseCount: any;
            totalRevenue: any;
            createdAt: any;
            publishedAt: any;
        };
    }>;
    updateContent(id: string, dto: UpdateContentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            title: any;
            description: any;
            creatorName: any;
            creatorId: any;
            contentType: any;
            thumbnailUrl: any;
            price: any;
            status: any;
            complianceStatus: any;
            complianceNotes: any;
            isPublished: any;
            viewCount: any;
            purchaseCount: any;
            totalRevenue: any;
            createdAt: any;
            publishedAt: any;
        };
    }>;
    reviewContent(id: string, dto: ReviewContentDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            title: any;
            description: any;
            creatorName: any;
            creatorId: any;
            contentType: any;
            thumbnailUrl: any;
            price: any;
            status: any;
            complianceStatus: any;
            complianceNotes: any;
            isPublished: any;
            viewCount: any;
            purchaseCount: any;
            totalRevenue: any;
            createdAt: any;
            publishedAt: any;
        };
    }>;
    removeContent(id: string, dto: RemoveContentDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: any;
            title: any;
            description: any;
            creatorName: any;
            creatorId: any;
            contentType: any;
            thumbnailUrl: any;
            price: any;
            status: any;
            complianceStatus: any;
            complianceNotes: any;
            isPublished: any;
            viewCount: any;
            purchaseCount: any;
            totalRevenue: any;
            createdAt: any;
            publishedAt: any;
        };
    }>;
}
//# sourceMappingURL=content.controller.d.ts.map