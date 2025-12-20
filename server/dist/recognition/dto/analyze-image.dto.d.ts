export declare enum SourceType {
    BASE64 = "base64",
    URL = "url",
    S3 = "s3"
}
export declare class ContentSourceDto {
    type: SourceType;
    data: string;
    bucket?: string;
}
export declare class ImageAnalysisOptionsDto {
    detectLabels?: boolean;
    detectFaces?: boolean;
    detectText?: boolean;
    detectModerationLabels?: boolean;
    detectCelebrities?: boolean;
    maxLabels?: number;
    minConfidence?: number;
}
export declare class AnalyzeImageDto {
    content: ContentSourceDto;
    options?: ImageAnalysisOptionsDto;
}
export declare class ImageAnalysisResponseDto {
    success: boolean;
    data?: any;
    error?: string;
    timestamp: Date;
}
//# sourceMappingURL=analyze-image.dto.d.ts.map