import { S3Client, GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'amnz-s3-pm-bucket';
const REGION = process.env.AWS_REGION || 'us-east-1';
const TEST_THUMBNAIL_KEY = 'thumbnails/myF3_uVJOG3PcAWy.jpg';

async function testS3Access() {
  console.log('🔍 Testing S3 Access Configuration\n');
  console.log('Configuration:');
  console.log('  Bucket:', BUCKET);
  console.log('  Region:', REGION);
  console.log('  Access Key:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) + '...');
  console.log('');

  const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // Test 1: Check if object exists
  console.log('📋 Test 1: Checking if object exists...');
  try {
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: TEST_THUMBNAIL_KEY,
    });
    const headResponse = await s3Client.send(headCommand);
    console.log('✅ Object exists!');
    console.log('   Content-Type:', headResponse.ContentType);
    console.log('   Content-Length:', headResponse.ContentLength);
    console.log('   ACL:', headResponse.Metadata?.acl || 'Not set');
    console.log('');
  } catch (error: any) {
    console.error('❌ Object not found or access denied:', error.message);
    console.log('');
  }

  // Test 2: Generate public URL
  console.log('📋 Test 2: Testing public URL access...');
  const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${TEST_THUMBNAIL_KEY}`;
  console.log('   Public URL:', publicUrl);
  
  try {
    const response = await fetch(publicUrl, { method: 'HEAD' });
    if (response.ok) {
      console.log('✅ Public URL is accessible!');
      console.log('   Status:', response.status);
      console.log('   Content-Type:', response.headers.get('content-type'));
    } else {
      console.log('❌ Public URL not accessible');
      console.log('   Status:', response.status, response.statusText);
      console.log('   This means the file is NOT public or CORS is blocking');
    }
  } catch (error: any) {
    console.error('❌ Failed to access public URL:', error.message);
  }
  console.log('');

  // Test 3: Generate signed URL
  console.log('📋 Test 3: Generating signed URL...');
  try {
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: TEST_THUMBNAIL_KEY,
    });
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    console.log('✅ Signed URL generated successfully!');
    console.log('   URL:', signedUrl.substring(0, 100) + '...');
    
    // Test signed URL
    const signedResponse = await fetch(signedUrl, { method: 'HEAD' });
    if (signedResponse.ok) {
      console.log('✅ Signed URL is accessible!');
      console.log('   Status:', signedResponse.status);
    } else {
      console.log('❌ Signed URL not accessible');
      console.log('   Status:', signedResponse.status);
    }
  } catch (error: any) {
    console.error('❌ Failed to generate or access signed URL:', error.message);
  }
  console.log('');

  // Test 4: Check CORS by making a request from a browser-like context
  console.log('📋 Test 4: Testing CORS headers...');
  try {
    const response = await fetch(publicUrl, {
      method: 'GET',
      headers: {
        'Origin': 'https://velolink.club',
      },
    });
    
    const corsHeader = response.headers.get('access-control-allow-origin');
    if (corsHeader) {
      console.log('✅ CORS is configured!');
      console.log('   Access-Control-Allow-Origin:', corsHeader);
    } else {
      console.log('❌ CORS headers not found');
      console.log('   This will cause issues in browsers!');
    }
  } catch (error: any) {
    console.error('❌ CORS test failed:', error.message);
  }
  console.log('');

  // Recommendations
  console.log('📝 Recommendations:\n');
  console.log('1. Make thumbnails public:');
  console.log('   aws s3api put-object-acl --bucket', BUCKET, '--key', TEST_THUMBNAIL_KEY, '--acl public-read\n');
  
  console.log('2. Add CORS configuration to bucket:');
  console.log('   See AWS_S3_SETUP.md for CORS configuration\n');
  
  console.log('3. Verify bucket policy allows public access to thumbnails/*:');
  console.log('   aws s3api get-bucket-policy --bucket', BUCKET);
}

testS3Access().catch(console.error);
