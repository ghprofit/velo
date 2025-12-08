import { ContentSourceDto } from './analyze-image.dto';
export declare class NotificationChannelDto {
    snsTopicArn: string;
    roleArn: string;
}
export declare class VideoAnalysisOptionsDto {
    detectLabels?: boolean;
    detectFaces?: boolean;
    detectText?: boolean;
    detectModerationLabels?: boolean;
    detectCelebrities?: boolean;
    detectPersons?: boolean;
    notificationChannel?: NotificationChannelDto;
}
export declare class AnalyzeVideoDto {
    content: ContentSourceDto;
    options?: VideoAnalysisOptionsDto;
}
export declare class VideoAnalysisResponseDto {
    success: boolean;
    jobId?: string;
    status?: string;
    data?: any;
    error?: string;
    timestamp: Date;
}
export declare class GetVideoResultsDto {
    jobId: string;
    nextToken?: string;
}
//# sourceMappingURL=analyze-video.dto.d.ts.map