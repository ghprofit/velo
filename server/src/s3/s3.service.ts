import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { nanoid } from 'nanoid';
import { Readable } from 'stream';
import * as https from 'https';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'velo-content';

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

    this.s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
      requestHandler: new NodeHttpHandler({
        requestTimeout: 300000, // 5 minutes for large video uploads
        connectionTimeout: 30000, // 30 seconds to establish connection
        httpsAgent: new https.Agent({
          keepAlive: true,
          timeout: 300000, // 5 minutes socket timeout
          maxSockets: 50,
        }),
      }),
      maxAttempts: 5, // Retry up to 5 times for network issues
    });
  }

  /**
   * Upload a file to S3
   * @param base64Data - Base64 encoded file data
   * @param fileName - Original file name
   * @param contentType - MIME type of the file
   * @param folder - Optional folder path in S3 bucket
   * @returns S3 key (path) of the uploaded file
   */
  async uploadFile(
    base64Data: string,
    fileName: string,
    contentType: string,
    folder: string = 'content',
  ): Promise<{ key: string; url: string }> {
    try {
      // Remove the data URL prefix if present (e.g., "data:image/png;base64,")
      let base64Content = base64Data;
      if (base64Data.includes('base64,')) {
        const parts = base64Data.split('base64,');
        base64Content = parts[1] || base64Data;
      }

      // Convert base64 to buffer
      const fileBuffer = Buffer.from(base64Content, 'base64');

      // Generate unique file name
      const fileExtension = fileName.split('.').pop() || 'bin';
      const uniqueFileName = `${nanoid(16)}.${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      // Upload to S3
      // Make thumbnails publicly accessible, but keep content private
      const isPublic = folder === 'thumbnails';

      const upload = new Upload({
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

      // Construct the S3 URL
      const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
      let url: string;

      if (isPublic) {
        // Public URL for thumbnails
        url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
      } else {
        // Signed URL for private content (24-hour expiry)
        url = await this.getSignedUrl(key, 86400); // 24 hours
      }

      return { key, url };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Upload a file stream to S3 (for multipart uploads)
   * @param fileStream - Readable stream or Buffer from multer
   * @param fileName - Original file name
   * @param contentType - MIME type of the file
   * @param folder - Optional folder path in S3 bucket
   * @returns S3 key (path) and URL of the uploaded file
   */
  async uploadFileStream(
    fileStream: Buffer | Readable,
    fileName: string,
    contentType: string,
    folder: string = 'content',
  ): Promise<{ key: string; url: string }> {
    try {
      // Generate unique file name
      const fileExtension = fileName.split('.').pop() || 'bin';
      const uniqueFileName = `${nanoid(16)}.${fileExtension}`;
      const key = `${folder}/${uniqueFileName}`;

      // Make thumbnails publicly accessible, but keep content private
      const isPublic = folder === 'thumbnails';

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileStream, // Accepts Buffer or Stream
          ContentType: contentType,
          ACL: isPublic ? 'public-read' : undefined,
        },
        queueSize: 4, // Concurrent part uploads
        partSize: 5 * 1024 * 1024, // 5MB parts for multipart upload
        leavePartsOnError: false, // Clean up failed uploads
      });

      await upload.done();

      // Construct the S3 URL
      const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
      let url: string;

      if (isPublic) {
        url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
      } else {
        url = await this.getSignedUrl(key, 86400); // 24 hours
      }

      return { key, url };
    } catch (error) {
      console.error('Error uploading file stream to S3:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  /**
   * Upload multiple files to S3
   * @param files - Array of file data
   * @param folder - Optional folder path in S3 bucket
   * @returns Array of S3 keys and URLs
   */
  async uploadMultipleFiles(
    files: Array<{ base64Data: string; fileName: string; contentType: string }>,
    folder: string = 'content',
  ): Promise<Array<{ key: string; url: string }>> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.base64Data, file.fileName, file.contentType, folder),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from S3
   * @param key - S3 key (path) of the file to delete
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }

  /**
   * Delete multiple files from S3
   * @param keys - Array of S3 keys to delete
   */
  async deleteMultipleFiles(keys: string[]): Promise<void> {
    const deletePromises = keys.map((key) => this.deleteFile(key));
    await Promise.all(deletePromises);
  }

  /**
   * Get a signed URL for temporary access to a private file
   * @param key - S3 key of the file
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (!this.bucketName) {
        throw new InternalServerErrorException('S3 bucket name not configured');
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      console.log(`[S3] Generated signed URL for key: ${key} (expires in ${expiresIn}s)`);
      return signedUrl;
    } catch (error) {
      const err = error as Error;
      console.error(`[S3] Error generating signed URL for key "${key}":`, err.message);
      console.error('[S3] Bucket:', this.bucketName, 'Region:', this.configService.get<string>('AWS_REGION'));
      throw new InternalServerErrorException(`Failed to generate signed URL: ${err.message}`);
    }
  }

  /**
   * Get signed URLs for multiple files
   * @param keys - Array of S3 keys
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Array of signed URLs
   */
  async getSignedUrls(
    keys: string[],
    expiresIn: number = 3600,
  ): Promise<string[]> {
    const urlPromises = keys.map((key) => this.getSignedUrl(key, expiresIn));
    return Promise.all(urlPromises);
  }

  /**
   * Get a signed URL for uploading a file (presigned PUT)
   * @param key - S3 key where the file will be uploaded
   * @param contentType - MIME type of the file
   * @param expiresIn - Expiration time in seconds (default: 15 minutes)
   * @returns Signed URL for upload
   */
  async getUploadSignedUrl(
    key: string,
    contentType: string,
    expiresIn: number = 900,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating upload signed URL:', error);
      throw new InternalServerErrorException(
        'Failed to generate upload signed URL',
      );
    }
  }
}
