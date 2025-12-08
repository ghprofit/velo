import { RecognitionService } from './recognition.service';
declare enum SourceType {
    BASE64 = "base64",
    URL = "url",
    S3 = "s3"
}
declare class ContentSourceDto {
    type: SourceType;
    data: string;
    bucket?: string;
}
declare class CheckSafetyDto {
    content: ContentSourceDto;
    minConfidence?: number;
}
declare class BatchItemDto {
    id: string;
    content: ContentSourceDto;
}
declare class BatchCheckSafetyDto {
    items: BatchItemDto[];
    minConfidence?: number;
}
declare class VideoSafetyDto {
    content: ContentSourceDto;
    minConfidence?: number;
}
export declare class RecognitionController {
    private readonly recognitionService;
    private readonly logger;
    constructor(recognitionService: RecognitionService);
    checkSafety(dto: CheckSafetyDto): Promise<{
        success: boolean;
        isSafe: boolean;
        confidence: number;
        flaggedCategories: string[];
        moderationLabels: import("./recognition.service").ModerationLabel[];
        message: string;
        timestamp: Date;
        error?: undefined;
    } | {
        success: boolean;
        isSafe: boolean;
        error: any;
        timestamp: Date;
        confidence?: undefined;
        flaggedCategories?: undefined;
        moderationLabels?: undefined;
        message?: undefined;
    }>;
    isSafe(dto: CheckSafetyDto): Promise<{
        success: boolean;
        isSafe: boolean;
        message: string;
        timestamp: Date;
        error?: undefined;
    } | {
        success: boolean;
        isSafe: boolean;
        error: any;
        timestamp: Date;
        message?: undefined;
    }>;
    checkBatchSafety(dto: BatchCheckSafetyDto): Promise<{
        success: boolean;
        totalItems: number;
        safeCount: number;
        unsafeCount: number;
        allSafe: boolean;
        results: {
            id: string;
            isSafe: boolean;
            flaggedCategories: string[];
            error?: string;
        }[];
        message: string;
        timestamp: Date;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        timestamp: Date;
        totalItems?: undefined;
        safeCount?: undefined;
        unsafeCount?: undefined;
        allSafe?: undefined;
        results?: undefined;
        message?: undefined;
    }>;
    checkVideoSafety(dto: VideoSafetyDto): Promise<{
        success: boolean;
        jobId: string;
        status: string;
        message: string;
        timestamp: Date;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        timestamp: Date;
        jobId?: undefined;
        status?: undefined;
        message?: undefined;
    }>;
    getVideoSafetyResults(jobId: string, nextToken?: string): Promise<{
        success: boolean;
        jobId: string;
        status: "FAILED" | "IN_PROGRESS" | "SUCCEEDED";
        statusMessage: string | undefined;
        isSafe: boolean | undefined;
        unsafeSegmentsCount: number;
        unsafeSegments: {
            timestampMs: number;
            label: string;
            confidence: number;
        }[] | undefined;
        message: string;
        timestamp: Date;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        timestamp: Date;
        jobId?: undefined;
        status?: undefined;
        statusMessage?: undefined;
        isSafe?: undefined;
        unsafeSegmentsCount?: undefined;
        unsafeSegments?: undefined;
        message?: undefined;
    }>;
    getCategories(): {
        success: boolean;
        categories: string[];
        description: string;
        timestamp: Date;
    };
    healthCheck(): Promise<{
        service: string;
        provider: string;
        purpose: string;
        timestamp: string;
        status: string;
        configured: boolean;
        region: string;
    }>;
}
export {};
//# sourceMappingURL=recognition.controller.d.ts.map