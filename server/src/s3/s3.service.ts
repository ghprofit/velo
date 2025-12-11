import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { nanoid } from 'nanoid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'velo-content';

    if (!region || !accessKeyId || !secretAccessKey || !this.bucketName) {
      console.warn('⚠️  AWS S3 credentials not configured. File uploads will fail.');
      console.warn('   Please set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your .env file.');
    }

    this.s3Client = new S3Client({
      region: region || 'us-east-1',
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
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
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
          // Make files publicly readable (adjust based on your security needs)
          // ACL: 'public-read',
        },
      });

      await upload.done();

      // Construct the S3 URL
      const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;

      return { key, url };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
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
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
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
