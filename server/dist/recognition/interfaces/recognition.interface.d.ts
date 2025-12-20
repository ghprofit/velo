export interface RecognitionConfig {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3Bucket?: string;
}
export type ContentType = 'image' | 'video' | 'document';
export interface ContentSource {
    type: 'base64' | 'url' | 's3';
    data: string;
    bucket?: string;
}
export interface ImageAnalysisOptions {
    detectLabels?: boolean;
    detectFaces?: boolean;
    detectText?: boolean;
    detectModerationLabels?: boolean;
    detectCelebrities?: boolean;
    recognizeCustomLabels?: boolean;
    maxLabels?: number;
    minConfidence?: number;
}
export interface VideoAnalysisOptions {
    detectLabels?: boolean;
    detectFaces?: boolean;
    detectText?: boolean;
    detectModerationLabels?: boolean;
    detectCelebrities?: boolean;
    detectPersons?: boolean;
    notificationChannel?: {
        snsTopicArn: string;
        roleArn: string;
    };
}
export interface DocumentAnalysisOptions {
    extractText?: boolean;
    extractTables?: boolean;
    extractForms?: boolean;
    extractKeyValuePairs?: boolean;
}
export interface LabelDetection {
    name: string;
    confidence: number;
    instances?: Array<{
        boundingBox?: BoundingBox;
        confidence: number;
    }>;
    parents?: string[];
    categories?: string[];
}
export interface FaceDetection {
    boundingBox?: BoundingBox;
    confidence: number;
    landmarks?: Array<{
        type: string;
        x: number;
        y: number;
    }>;
    pose?: {
        roll: number;
        yaw: number;
        pitch: number;
    };
    quality?: {
        brightness: number;
        sharpness: number;
    };
    emotions?: Array<{
        type: string;
        confidence: number;
    }>;
    ageRange?: {
        low: number;
        high: number;
    };
    gender?: {
        value: string;
        confidence: number;
    };
    smile?: {
        value: boolean;
        confidence: number;
    };
    eyeglasses?: {
        value: boolean;
        confidence: number;
    };
    sunglasses?: {
        value: boolean;
        confidence: number;
    };
    beard?: {
        value: boolean;
        confidence: number;
    };
    mustache?: {
        value: boolean;
        confidence: number;
    };
    eyesOpen?: {
        value: boolean;
        confidence: number;
    };
    mouthOpen?: {
        value: boolean;
        confidence: number;
    };
}
export interface TextDetection {
    detectedText: string;
    type: 'LINE' | 'WORD';
    confidence: number;
    boundingBox?: BoundingBox;
    parentId?: number;
    id?: number;
}
export interface ModerationLabel {
    name: string;
    confidence: number;
    parentName?: string;
    taxonomyLevel?: number;
}
export interface CelebrityRecognition {
    name: string;
    confidence: number;
    id?: string;
    urls?: string[];
    boundingBox?: BoundingBox;
}
export interface BoundingBox {
    width: number;
    height: number;
    left: number;
    top: number;
}
export interface DocumentTextBlock {
    blockType: string;
    text?: string;
    confidence: number;
    id?: string;
    relationships?: Array<{
        type: string;
        ids: string[];
    }>;
    geometry?: {
        boundingBox?: BoundingBox;
        polygon?: Array<{
            x: number;
            y: number;
        }>;
    };
}
export interface KeyValuePair {
    key: string;
    value: string;
    confidence: number;
}
export interface TableCell {
    text: string;
    confidence: number;
    rowIndex: number;
    columnIndex: number;
    rowSpan: number;
    columnSpan: number;
}
export interface ImageAnalysisResult {
    contentType: 'image';
    timestamp: Date;
    labels?: LabelDetection[];
    faces?: FaceDetection[];
    text?: TextDetection[];
    moderationLabels?: ModerationLabel[];
    celebrities?: CelebrityRecognition[];
    metadata?: {
        width?: number;
        height?: number;
        format?: string;
    };
}
export interface VideoAnalysisResult {
    contentType: 'video';
    timestamp: Date;
    jobId: string;
    status: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
    statusMessage?: string;
    labels?: Array<{
        timestamp: number;
        label: LabelDetection;
    }>;
    faces?: Array<{
        timestamp: number;
        face: FaceDetection;
    }>;
    text?: Array<{
        timestamp: number;
        textDetection: TextDetection;
    }>;
    moderationLabels?: Array<{
        timestamp: number;
        moderationLabel: ModerationLabel;
    }>;
    celebrities?: Array<{
        timestamp: number;
        celebrity: CelebrityRecognition;
    }>;
    persons?: Array<{
        timestamp: number;
        person: {
            index: number;
            boundingBox?: BoundingBox;
        };
    }>;
    videoMetadata?: {
        codec?: string;
        durationMillis?: number;
        format?: string;
        frameRate?: number;
        frameWidth?: number;
        frameHeight?: number;
    };
}
export interface DocumentAnalysisResult {
    contentType: 'document';
    timestamp: Date;
    text?: string;
    blocks?: DocumentTextBlock[];
    tables?: Array<{
        rows: number;
        columns: number;
        cells: TableCell[];
    }>;
    keyValuePairs?: KeyValuePair[];
    documentMetadata?: {
        pages?: number;
    };
}
export type AnalysisResult = ImageAnalysisResult | VideoAnalysisResult | DocumentAnalysisResult;
export interface BatchAnalysisRequest {
    id: string;
    content: ContentSource;
    contentType: ContentType;
    options?: ImageAnalysisOptions | VideoAnalysisOptions | DocumentAnalysisOptions;
}
export interface BatchAnalysisResult {
    totalItems: number;
    successCount: number;
    failureCount: number;
    results: Array<{
        id: string;
        success: boolean;
        result?: AnalysisResult;
        error?: string;
    }>;
}
export interface VideoJobStatus {
    jobId: string;
    status: 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
    statusMessage?: string;
    percentComplete?: number;
}
//# sourceMappingURL=recognition.interface.d.ts.map