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
var RecognitionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecognitionService = void 0;
const common_1 = require("@nestjs/common");
const client_rekognition_1 = require("@aws-sdk/client-rekognition");
let RecognitionService = RecognitionService_1 = class RecognitionService {
    constructor() {
        this.logger = new common_1.Logger(RecognitionService_1.name);
        this.rekognitionClient = null;
        this.isConfigured = false;
        this.region = process.env.AWS_REGION || 'us-east-1';
        this.s3Bucket = process.env.AWS_S3_BUCKET;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
        if (accessKeyId && secretAccessKey) {
            this.rekognitionClient = new client_rekognition_1.RekognitionClient({
                region: this.region,
                credentials: { accessKeyId, secretAccessKey },
            });
            this.isConfigured = true;
            this.logger.log('AWS Rekognition configured for content safety');
        }
        else {
            this.logger.warn('AWS credentials not found. Content safety checks will be simulated.');
        }
    }
    async checkImageSafety(content, minConfidence = 50) {
        this.logger.log('Checking image safety');
        try {
            const imageInput = await this.getImageInput(content);
            if (!this.isConfigured || !this.rekognitionClient) {
                this.logger.warn('[SIMULATED] Image safety check');
                return this.getSimulatedSafetyResult();
            }
            const command = new client_rekognition_1.DetectModerationLabelsCommand({
                Image: imageInput,
                MinConfidence: minConfidence,
            });
            const response = await this.rekognitionClient.send(command);
            const labels = response.ModerationLabels || [];
            const moderationLabels = labels.map((label) => ({
                name: label.Name || '',
                confidence: label.Confidence || 0,
                parentName: label.ParentName,
                taxonomyLevel: label.TaxonomyLevel,
            }));
            const seriousCategoriesOnly = ['Explicit Nudity', 'Suggestive', 'Violence', 'Visually Disturbing'];
            const filteredLabels = moderationLabels.filter((label) => {
                const category = label.parentName || label.name;
                return seriousCategoriesOnly.some((serious) => category.includes(serious));
            });
            const flaggedCategories = [
                ...new Set(filteredLabels
                    .map((l) => l.parentName || l.name)
                    .filter((name) => name)),
            ];
            const isSafe = filteredLabels.length === 0;
            const maxConfidence = filteredLabels.length > 0
                ? Math.max(...filteredLabels.map((l) => l.confidence))
                : 100;
            this.logger.log(`Image safety check complete: ${isSafe ? 'SAFE' : 'UNSAFE'}`);
            return {
                isSafe,
                confidence: isSafe ? 100 : maxConfidence,
                flaggedCategories,
                moderationLabels: filteredLabels,
                timestamp: new Date(),
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Failed to check image safety:', errorMessage);
            throw new common_1.BadRequestException(`Safety check failed: ${errorMessage}`);
        }
    }
    async checkBatchSafety(items, minConfidence = 50) {
        this.logger.log(`Checking safety for ${items.length} items`);
        const result = {
            totalItems: items.length,
            safeCount: 0,
            unsafeCount: 0,
            results: [],
        };
        for (const item of items) {
            try {
                const safetyResult = await this.checkImageSafety(item.content, minConfidence);
                result.results.push({
                    id: item.id,
                    isSafe: safetyResult.isSafe,
                    flaggedCategories: safetyResult.flaggedCategories,
                });
                if (safetyResult.isSafe) {
                    result.safeCount++;
                }
                else {
                    result.unsafeCount++;
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Check failed';
                result.results.push({
                    id: item.id,
                    isSafe: false,
                    flaggedCategories: [],
                    error: errorMessage,
                });
                result.unsafeCount++;
            }
        }
        this.logger.log(`Batch safety check complete: ${result.safeCount} safe, ${result.unsafeCount} unsafe`);
        return result;
    }
    async startVideoSafetyCheck(content, minConfidence = 50, notificationChannel) {
        this.logger.log('Starting video safety check');
        if (content.type !== 's3') {
            throw new common_1.BadRequestException('Video safety check requires S3 source. Upload video to S3 first.');
        }
        try {
            if (!this.isConfigured || !this.rekognitionClient) {
                this.logger.warn('[SIMULATED] Video safety check');
                return {
                    jobId: `simulated-${Date.now()}`,
                    status: 'IN_PROGRESS',
                };
            }
            const videoInput = {
                S3Object: {
                    Bucket: content.bucket || this.s3Bucket,
                    Name: content.data,
                },
            };
            const command = new client_rekognition_1.StartContentModerationCommand({
                Video: videoInput,
                MinConfidence: minConfidence,
                NotificationChannel: notificationChannel
                    ? {
                        SNSTopicArn: notificationChannel.snsTopicArn,
                        RoleArn: notificationChannel.roleArn,
                    }
                    : undefined,
            });
            const response = await this.rekognitionClient.send(command);
            this.logger.log(`Video safety job started: ${response.JobId}`);
            return {
                jobId: response.JobId || '',
                status: 'IN_PROGRESS',
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Failed to start video safety check:', errorMessage);
            throw new common_1.BadRequestException(`Video safety check failed: ${errorMessage}`);
        }
    }
    async getVideoSafetyResults(jobId, nextToken) {
        this.logger.log(`Getting video safety results for job: ${jobId}`);
        try {
            if (!this.isConfigured || !this.rekognitionClient) {
                this.logger.warn('[SIMULATED] Video safety results');
                return {
                    jobId,
                    status: 'SUCCEEDED',
                    isSafe: true,
                    unsafeSegments: [],
                };
            }
            const command = new client_rekognition_1.GetContentModerationCommand({
                JobId: jobId,
                NextToken: nextToken,
            });
            const response = await this.rekognitionClient.send(command);
            const unsafeSegments = response.ModerationLabels?.map((item) => ({
                timestampMs: item.Timestamp || 0,
                label: item.ModerationLabel?.Name || '',
                confidence: item.ModerationLabel?.Confidence || 0,
            })) || [];
            const isSafe = unsafeSegments.length === 0;
            this.logger.log(`Video safety results: ${isSafe ? 'SAFE' : 'UNSAFE'} (${unsafeSegments.length} unsafe segments)`);
            return {
                jobId,
                status: response.JobStatus,
                statusMessage: response.StatusMessage,
                isSafe,
                unsafeSegments,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Failed to get video safety results:', errorMessage);
            throw new common_1.BadRequestException(`Failed to get results: ${errorMessage}`);
        }
    }
    async isContentSafe(content, minConfidence = 50) {
        const result = await this.checkImageSafety(content, minConfidence);
        return result.isSafe;
    }
    getSafetyCategories() {
        return [
            'Explicit Nudity',
            'Suggestive',
            'Violence',
            'Visually Disturbing',
            'Rude Gestures',
            'Drugs',
            'Tobacco',
            'Alcohol',
            'Gambling',
            'Hate Symbols',
        ];
    }
    async getImageInput(content) {
        switch (content.type) {
            case 'base64':
                return { Bytes: Buffer.from(content.data, 'base64') };
            case 's3':
                return {
                    S3Object: {
                        Bucket: content.bucket || this.s3Bucket,
                        Name: content.data,
                    },
                };
            case 'url':
                const response = await fetch(content.data);
                const arrayBuffer = await response.arrayBuffer();
                return { Bytes: Buffer.from(arrayBuffer) };
            default:
                throw new common_1.BadRequestException('Unknown content source type');
        }
    }
    getSimulatedSafetyResult() {
        return {
            isSafe: true,
            confidence: 100,
            flaggedCategories: [],
            moderationLabels: [],
            timestamp: new Date(),
        };
    }
    async healthCheck() {
        return {
            status: 'ok',
            configured: this.isConfigured,
            region: this.region,
        };
    }
};
exports.RecognitionService = RecognitionService;
exports.RecognitionService = RecognitionService = RecognitionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RecognitionService);
//# sourceMappingURL=recognition.service.js.map