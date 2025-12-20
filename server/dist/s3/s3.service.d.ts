import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private s3Client;
    private bucketName;
    constructor(configService: ConfigService);
    uploadFile(base64Data: string, fileName: string, contentType: string, folder?: string): Promise<{
        key: string;
        url: string;
    }>;
    uploadMultipleFiles(files: Array<{
        base64Data: string;
        fileName: string;
        contentType: string;
    }>, folder?: string): Promise<Array<{
        key: string;
        url: string;
    }>>;
    deleteFile(key: string): Promise<void>;
    deleteMultipleFiles(keys: string[]): Promise<void>;
    getSignedUrl(key: string, expiresIn?: number): Promise<string>;
    getSignedUrls(keys: string[], expiresIn?: number): Promise<string[]>;
    getUploadSignedUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
}
//# sourceMappingURL=s3.service.d.ts.map