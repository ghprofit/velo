import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  getAppInfo() {
    return {
      name: 'VeloLink API',
      description: 'Content platform with authentication, verification, and anonymous buyer tracking',
      version: '1.0.0',
      apiPrefix: 'api',
    };
  }

  getAWSHealth() {
    const hasS3Credentials = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION
    );

    const hasRekognition = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    );

    return {
      s3: {
        configured: hasS3Credentials,
        bucket: process.env.AWS_S3_BUCKET_NAME || 'NOT_SET',
        region: process.env.AWS_REGION || 'NOT_SET',
        hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      },
      rekognition: {
        configured: hasRekognition,
        region: process.env.AWS_REGION || 'NOT_SET',
        minConfidence: process.env.AWS_REKOGNITION_MIN_CONFIDENCE || '70',
      },
      ses: {
        configured: !!process.env.SES_FROM_EMAIL,
        fromEmail: process.env.SES_FROM_EMAIL || 'NOT_SET',
      },
    };
  }
}
