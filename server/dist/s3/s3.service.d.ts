import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
export declare class S3Service {
    private configService;
    private s3Client;
    private bucketName;
    constructor(configService: ConfigService);
    uploadFile(base64Data: string, fileName: string, contentType: string, folder?: string): Promise<{
        key: string;
        url: string;
    }>;
    uploadFileStream(fileStream: Buffer | Readable, fileName: string, contentType: string, folder?: string): Promise<{
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
    getUploadSignedUrl(key: string, contentType: string, acl?: 'public-read' | 'private', expiresIn?: number): Promise<string>;
    getPresignedUploadUrl(fileName: string, contentType: string, fileType: 'content' | 'thumbnail'): Promise<{
        uploadUrl: string;
        key: string;
    }>;
}
//# sourceMappingURL=s3.service.d.ts.map