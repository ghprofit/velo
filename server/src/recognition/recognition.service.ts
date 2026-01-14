import { Injectable, Logger, BadRequestException, OnModuleInit } from '@nestjs/common';
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  StartContentModerationCommand,
  GetContentModerationCommand,
  Image,
  Video,
} from '@aws-sdk/client-rekognition';

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

@Injectable()
export class RecognitionService implements OnModuleInit {
  private readonly logger = new Logger(RecognitionService.name);
  private rekognitionClient: RekognitionClient | null = null;
  private isConfigured = false;
  private readonly region: string;
  private readonly s3Bucket?: string;
  private initializationError?: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.s3Bucket = process.env.AWS_S3_BUCKET;
  }

  async onModuleInit() {
    try {
      const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';

      if (accessKeyId && secretAccessKey) {
        this.rekognitionClient = new RekognitionClient({
          region: this.region,
          credentials: { accessKeyId, secretAccessKey },
        });

        this.isConfigured = true;
        this.logger.log('✅ AWS Rekognition configured successfully');
      } else {
        this.logger.warn(
          '⚠️  AWS credentials not found. Content safety checks will be simulated.',
        );
      }
    } catch (error) {
      const err = error as Error;
      this.initializationError = err.message;
      this.logger.error(
        `❌ Failed to initialize AWS Rekognition: ${err.message}. Falling back to simulated checks.`,
      );
      this.isConfigured = false;
      this.rekognitionClient = null;
    }
  }

  /**
   * Check if image content is safe
   * Detects explicit, violent, and disturbing content
   */
  async checkImageSafety(
    content: ContentSource,
    minConfidence: number = 50,
  ): Promise<SafetyCheckResult> {
    this.logger.log('Checking image safety');

    try {
      const imageInput = await this.getImageInput(content);

      if (!this.isConfigured || !this.rekognitionClient) {
        this.logger.warn('[SIMULATED] Image safety check');
        return this.getSimulatedSafetyResult();
      }

      const command = new DetectModerationLabelsCommand({
        Image: imageInput,
        MinConfidence: minConfidence,
      });

      const response = await this.rekognitionClient.send(command);
      const labels = response.ModerationLabels || [];

      const moderationLabels: ModerationLabel[] = labels.map(
        (label: any) => ({
          name: label.Name || '',
          confidence: label.Confidence || 0,
          parentName: label.ParentName,
          taxonomyLevel: label.TaxonomyLevel,
        }),
      );

      // Extract unique flagged categories
      const flaggedCategories = [
        ...new Set(
          moderationLabels
            .map((l) => l.parentName || l.name)
            .filter((name) => name),
        ),
      ];

      const isSafe = moderationLabels.length === 0;
      const maxConfidence =
        moderationLabels.length > 0
          ? Math.max(...moderationLabels.map((l) => l.confidence))
          : 100;

      this.logger.log(
        `Image safety check complete: ${isSafe ? 'SAFE' : 'UNSAFE'}`,
      );

      return {
        isSafe,
        confidence: isSafe ? 100 : maxConfidence,
        flaggedCategories,
        moderationLabels,
        timestamp: new Date(),
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to check image safety:', error);
      throw new BadRequestException(
        `Safety check failed: ${err.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Batch check multiple images for safety
   */
  async checkBatchSafety(
    items: Array<{ id: string; content: ContentSource }>,
    minConfidence: number = 50,
  ): Promise<BatchSafetyResult> {
    this.logger.log(`Checking safety for ${items.length} items`);

    const result: BatchSafetyResult = {
      totalItems: items.length,
      safeCount: 0,
      unsafeCount: 0,
      results: [],
    };

    for (const item of items) {
      try {
        const safetyResult = await this.checkImageSafety(
          item.content,
          minConfidence,
        );

        result.results.push({
          id: item.id,
          isSafe: safetyResult.isSafe,
          flaggedCategories: safetyResult.flaggedCategories,
        });

        if (safetyResult.isSafe) {
          result.safeCount++;
        } else {
          result.unsafeCount++;
        }
      } catch (error) {
        const err = error as Error;
        result.results.push({
          id: item.id,
          isSafe: false,
          flaggedCategories: [],
          error: err.message || 'Check failed',
        });
        result.unsafeCount++;
      }
    }

    this.logger.log(
      `Batch safety check complete: ${result.safeCount} safe, ${result.unsafeCount} unsafe`,
    );

    return result;
  }

  /**
   * Start video safety analysis (async operation)
   * Returns job ID for polling results
   */
  async startVideoSafetyCheck(
    content: ContentSource,
    minConfidence: number = 50,
    notificationChannel?: { snsTopicArn: string; roleArn: string },
  ): Promise<{ jobId: string; status: string }> {
    this.logger.log('Starting video safety check');

    if (content.type !== 's3') {
      throw new BadRequestException(
        'Video safety check requires S3 source. Upload video to S3 first.',
      );
    }

    try {
      if (!this.isConfigured || !this.rekognitionClient) {
        this.logger.warn('[SIMULATED] Video safety check');
        return {
          jobId: `simulated-${Date.now()}`,
          status: 'IN_PROGRESS',
        };
      }

      const videoInput: Video = {
        S3Object: {
          Bucket: content.bucket || this.s3Bucket,
          Name: content.data,
        },
      };

      const command = new StartContentModerationCommand({
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
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to start video safety check:', error);
      throw new BadRequestException(
        `Video safety check failed: ${err.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Get video safety check results
   */
  async getVideoSafetyResults(
    jobId: string,
    nextToken?: string,
  ): Promise<VideoSafetyJobResult> {
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

      const command = new GetContentModerationCommand({
        JobId: jobId,
        NextToken: nextToken,
      });

      const response = await this.rekognitionClient.send(command);

      const unsafeSegments =
        response.ModerationLabels?.map((item: any) => ({
          timestampMs: item.Timestamp || 0,
          label: item.ModerationLabel?.Name || '',
          confidence: item.ModerationLabel?.Confidence || 0,
        })) || [];

      const isSafe = unsafeSegments.length === 0;

      this.logger.log(
        `Video safety results: ${isSafe ? 'SAFE' : 'UNSAFE'} (${unsafeSegments.length} unsafe segments)`,
      );

      return {
        jobId,
        status: response.JobStatus as 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED',
        statusMessage: response.StatusMessage,
        isSafe,
        unsafeSegments,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to get video safety results:', error);
      throw new BadRequestException(
        `Failed to get results: ${err.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Quick safety check - returns just true/false
   */
  async isContentSafe(
    content: ContentSource,
    minConfidence: number = 50,
  ): Promise<boolean> {
    const result = await this.checkImageSafety(content, minConfidence);
    return result.isSafe;
  }

  /**
   * Get safety categories that would be flagged
   */
  getSafetyCategories(): string[] {
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

  /**
   * Helper: Convert content source to Rekognition Image input
   */
  private async getImageInput(content: ContentSource): Promise<Image> {
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
        throw new BadRequestException('Unknown content source type');
    }
  }

  /**
   * Helper: Get simulated safety result
   */
  private getSimulatedSafetyResult(): SafetyCheckResult {
    return {
      isSafe: true,
      confidence: 100,
      flaggedCategories: [],
      moderationLabels: [],
      timestamp: new Date(),
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    configured: boolean;
    region: string;
  }> {
    return {
      status: 'ok',
      configured: this.isConfigured,
      region: this.region,
    };
  }
}
