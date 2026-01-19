#!/usr/bin/env node
/**
 * Make all thumbnails in S3 bucket public
 * This script sets ACL to public-read for all files in the thumbnails/ folder
 */

import { S3Client, ListObjectsV2Command, PutObjectAclCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'amnz-s3-pm-bucket';
const REGION = process.env.AWS_REGION || 'us-east-1';

async function makePublic() {
  console.log('🔧 Making all thumbnails public...\n');
  console.log('Bucket:', BUCKET);
  console.log('Region:', REGION);
  console.log('');

  const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  try {
    // List all objects in thumbnails/ folder
    console.log('📋 Listing thumbnails...');
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'thumbnails/',
    });

    const listResponse = await s3Client.send(listCommand);
    const objects = listResponse.Contents || [];
    
    console.log(`Found ${objects.length} thumbnails\n`);

    if (objects.length === 0) {
      console.log('⚠️  No thumbnails found in bucket');
      return;
    }

    // Make each object public
    let successCount = 0;
    let errorCount = 0;

    for (const object of objects) {
      if (!object.Key) continue;

      try {
        const aclCommand = new PutObjectAclCommand({
          Bucket: BUCKET,
          Key: object.Key,
          ACL: 'public-read',
        });

        await s3Client.send(aclCommand);
        console.log(`✅ ${object.Key}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ ${object.Key}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('');
    console.log(`✅ Successfully made ${successCount} thumbnails public`);
    if (errorCount > 0) {
      console.log(`❌ Failed to update ${errorCount} thumbnails`);
    }

    console.log('\n✨ Done! Thumbnails should now be accessible at:');
    console.log(`   https://${BUCKET}.s3.${REGION}.amazonaws.com/thumbnails/[filename]`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

makePublic();
