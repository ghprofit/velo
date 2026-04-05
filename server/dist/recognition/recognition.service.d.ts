import { OnModuleInit } from '@nestjs/common';
export interface ContentSource {
    type: 'base64' | 'url' | 's3';
    data: string;
    bucket?: string;
}
export interface ModerationLabel {
    name: string;
    confidence: number;
    parentName?: string;
    taxonomyLevel?: number;
}
export interface SafetyCheckResult {
    isSafe: boolean;
    confidence: number;
    flaggedCategories: string[];
    moderationLabels: ModerationLabel[];
    timestamp: Date;
}
export interface BatchSafetyResult {
    totalItems: number;
    safeCount: number;
    unsafeCount: number;
    results: Array<{
        id: string;
        isSafe: boolean;
        flaggedCategories: string[];
        error?: string;
    }>;
}
export interface VideoSafetyJobResult {
    jobId: string;
    status: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
    statusMessage?: string;
    isSafe?: boolean;
    unsafeSegments?: Array<{
        timestampMs: number;
        label: string;
        confidence: number;
    }>;
}
export declare class RecognitionService implements OnModuleInit {
    private readonly logger;
    private rekognitionClient;
    private isConfigured;
    private readonly region;
    private readonly s3Bucket?;
    private initializationError?;
    constructor();
    onModuleInit(): Promise<void>;
    checkImageSafety(content: ContentSource, minConfidence?: number): Promise<SafetyCheckResult>;
    checkBatchSafety(items: Array<{
        id: string;
        content: ContentSource;
    }>, minConfidence?: number): Promise<BatchSafetyResult>;
    startVideoSafetyCheck(content: ContentSource, minConfidence?: number, notificationChannel?: {
        snsTopicArn: string;
        roleArn: string;
    }): Promise<{
        jobId: string;
        status: string;
    }>;
    getVideoSafetyResults(jobId: string, nextToken?: string): Promise<VideoSafetyJobResult>;
    isContentSafe(content: ContentSource, minConfidence?: number): Promise<boolean>;
    getSafetyCategories(): string[];
    private getImageInput;
    private getSimulatedSafetyResult;
    healthCheck(): Promise<{
        status: string;
        configured: boolean;
        region: string;
    }>;
}
//# sourceMappingURL=recognition.service.d.ts.map