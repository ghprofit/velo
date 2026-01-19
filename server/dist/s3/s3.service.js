"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const node_http_handler_1 = require("@smithy/node-http-handler");
const nanoid_1 = require("nanoid");
const https = __importStar(require("https"));
let S3Service = class S3Service {
    constructor(configService) {
        this.configService = configService;
        const region = this.configService.get('AWS_REGION');
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
        this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME') || 'velo-content';
        if (!region || !accessKeyId || !secretAccessKey) {
            console.error('❌ AWS S3 credentials not configured!');
            console.error('   Missing:', [
                !region && 'AWS_REGION',
                !accessKeyId && 'AWS_ACCESS_KEY_ID',
                !secretAccessKey && 'AWS_SECRET_ACCESS_KEY'
            ].filter(Boolean).join(', '));
            console.warn('   File uploads and signed URLs will fail.');
        }
        if (!this.bucketName || this.bucketName === 'velo-content') {
            console.warn('⚠️  AWS_S3_BUCKET_NAME not set in .env - using default: velo-content');
        }
        console.log('✓ S3 Service initialized:', {
            region: region || 'us-east-1',
            bucket: this.bucketName,
            credentialsConfigured: !!(accessKeyId && secretAccessKey)
        });
        this.s3Client = new client_s3_1.S3Client({
            region: region || 'us-east-1',
            credentials: accessKeyId && secretAccessKey ? {
                accessKeyId,
                secretAccessKey,
            } : undefined,
            requestHandler: new node_http_handler_1.NodeHttpHandler({
                requestTimeout: 300000,
                connectionTimeout: 30000,
                httpsAgent: new https.Agent({
                    keepAlive: true,
                    timeout: 300000,
                    maxSockets: 50,
                }),
            }),
            maxAttempts: 5,
        });
    }
    async uploadFile(base64Data, fileName, contentType, folder = 'content') {
        try {
            let base64Content = base64Data;
            if (base64Data.includes('base64,')) {
                const parts = base64Data.split('base64,');
                base64Content = parts[1] || base64Data;
            }
            const fileBuffer = Buffer.from(base64Content, 'base64');
            const fileExtension = fileName.split('.').pop() || 'bin';
            const uniqueFileName = `${(0, nanoid_1.nanoid)(16)}.${fileExtension}`;
            const key = `${folder}/${uniqueFileName}`;
            const isPublic = folder === 'thumbnails';
            const upload = new lib_storage_1.Upload({
                client: this.s3Client,
                params: {
                    Bucket: this.bucketName,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: contentType,
                    ACL: isPublic ? 'public-read' : undefined,
                },
            });
            await upload.done();
            const region = this.configService.get('AWS_REGION') || 'us-east-1';
            let url;
            if (isPublic) {
                url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
            }
            else {
                url = await this.getSignedUrl(key, 86400);
            }
            return { key, url };
        }
        catch (error) {
            console.error('Error uploading file to S3:', error);
            throw new common_1.InternalServerErrorException('Failed to upload file to S3');
        }
    }
    async uploadFileStream(fileStream, fileName, contentType, folder = 'content') {
        try {
            const fileExtension = fileName.split('.').pop() || 'bin';
            const uniqueFileName = `${(0, nanoid_1.nanoid)(16)}.${fileExtension}`;
            const key = `${folder}/${uniqueFileName}`;
            const isPublic = folder === 'thumbnails';
            const upload = new lib_storage_1.Upload({
                client: this.s3Client,
                params: {
                    Bucket: this.bucketName,
                    Key: key,
                    Body: fileStream,
                    ContentType: contentType,
                    ACL: isPublic ? 'public-read' : undefined,
                },
                queueSize: 4,
                partSize: 5 * 1024 * 1024,
                leavePartsOnError: false,
            });
            await upload.done();
            const region = this.configService.get('AWS_REGION') || 'us-east-1';
            let url;
            if (isPublic) {
                url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
            }
            else {
                url = await this.getSignedUrl(key, 86400);
            }
            return { key, url };
        }
        catch (error) {
            console.error('Error uploading file stream to S3:', error);
            throw new common_1.InternalServerErrorException('Failed to upload file to S3');
        }
    }
    async uploadMultipleFiles(files, folder = 'content') {
        const uploadPromises = files.map((file) => this.uploadFile(file.base64Data, file.fileName, file.contentType, folder));
        return Promise.all(uploadPromises);
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
        }
        catch (error) {
            console.error('Error deleting file from S3:', error);
            throw new common_1.InternalServerErrorException('Failed to delete file from S3');
        }
    }
    async deleteMultipleFiles(keys) {
        const deletePromises = keys.map((key) => this.deleteFile(key));
        await Promise.all(deletePromises);
    }
    async getSignedUrl(key, expiresIn = 3600) {
        try {
            if (!this.bucketName) {
                throw new common_1.InternalServerErrorException('S3 bucket name not configured');
            }
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn,
            });
            console.log(`[S3] Generated signed URL for key: ${key} (expires in ${expiresIn}s)`);
            return signedUrl;
        }
        catch (error) {
            const err = error;
            console.error(`[S3] Error generating signed URL for key "${key}":`, err.message);
            console.error('[S3] Bucket:', this.bucketName, 'Region:', this.configService.get('AWS_REGION'));
            throw new common_1.InternalServerErrorException(`Failed to generate signed URL: ${err.message}`);
        }
    }
    async getSignedUrls(keys, expiresIn = 3600) {
        const urlPromises = keys.map((key) => this.getSignedUrl(key, expiresIn));
        return Promise.all(urlPromises);
    }
    async getUploadSignedUrl(key, contentType, expiresIn = 900) {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
            });
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn,
            });
            return signedUrl;
        }
        catch (error) {
            console.error('Error generating upload signed URL:', error);
            throw new common_1.InternalServerErrorException('Failed to generate upload signed URL');
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map