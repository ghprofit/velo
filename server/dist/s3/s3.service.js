"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const nanoid_1 = require("nanoid");
let S3Service = class S3Service {
    constructor(configService) {
        this.configService = configService;
        const region = this.configService.get('AWS_REGION');
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
        this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME') || 'velo-content';
        if (!region || !accessKeyId || !secretAccessKey || !this.bucketName) {
            console.warn('⚠️  AWS S3 credentials not configured. File uploads will fail.');
            console.warn('   Please set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your .env file.');
        }
        this.s3Client = new client_s3_1.S3Client({
            region: region || 'us-east-1',
            credentials: accessKeyId && secretAccessKey ? {
                accessKeyId,
                secretAccessKey,
            } : undefined,
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
            const upload = new lib_storage_1.Upload({
                client: this.s3Client,
                params: {
                    Bucket: this.bucketName,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: contentType,
                    ACL: 'public-read',
                },
            });
            await upload.done();
            const region = this.configService.get('AWS_REGION') || 'us-east-1';
            const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
            return { key, url };
        }
        catch (error) {
            console.error('Error uploading file to S3:', error);
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
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
                expiresIn,
            });
            return signedUrl;
        }
        catch (error) {
            console.error('Error generating signed URL:', error);
            throw new common_1.InternalServerErrorException('Failed to generate signed URL');
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