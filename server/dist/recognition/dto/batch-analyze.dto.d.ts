import { ContentSourceDto, ImageAnalysisOptionsDto } from './analyze-image.dto';
import { VideoAnalysisOptionsDto } from './analyze-video.dto';
import { DocumentAnalysisOptionsDto } from './analyze-document.dto';
export declare enum ContentTypeEnum {
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document"
}
export declare class BatchItemDto {
    id: string;
    content: ContentSourceDto;
    contentType: ContentTypeEnum;
    options?: ImageAnalysisOptionsDto | VideoAnalysisOptionsDto | DocumentAnalysisOptionsDto;
}
export declare class BatchAnalyzeDto {
    items: BatchItemDto[];
}
export declare class BatchAnalysisResponseDto {
    success: boolean;
    totalItems: number;
    successCount: number;
    failureCount: number;
    results: Array<{
        id: string;
        success: boolean;
        contentType: string;
        result?: any;
        error?: string;
    }>;
    timestamp: Date;
}
//# sourceMappingURL=batch-analyze.dto.d.ts.map