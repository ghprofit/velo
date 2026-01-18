import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const uploadLogo = async () => {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'velolink-content';

  if (!region || !accessKeyId || !secretAccessKey) {
    console.error('❌ AWS credentials not found in .env file');
    console.error('   Please set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    // Read the PNG logo file
    const logoPath = join(__dirname, '..', 'assets', 'logo_pngs', 'Secondary_Logo_black.png');
    const fileBuffer = readFileSync(logoPath);

    console.log('📤 Uploading Secondary_Logo_black.png to S3...');

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: 'Secondary_Logo_black.png',
      Body: fileBuffer,
      ContentType: 'image/png',
      ACL: 'public-read', // Make it publicly accessible
      CacheControl: 'max-age=31536000', // Cache for 1 year
    });

    await s3Client.send(command);

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/Secondary_Logo_black.png`;
    console.log('✅ Logo uploaded successfully!');
    console.log(`📍 URL: ${url}`);
    console.log('\n💡 This URL is now used in email templates.');
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    process.exit(1);
  }
};

uploadLogo();
