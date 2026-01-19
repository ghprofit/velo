# Fixing Images Not Showing on AWS Production

## Problem
Images showing locally but not on AWS production server (velolink.club).
- Request returns 200 OK
- Images in S3 bucket but not accessible
- Next.js Image optimization working but can't fetch S3 images

## Root Causes

### 1. S3 Bucket ACL Permissions
Thumbnails uploaded to S3 don't have public-read ACL by default, even though the upload code tries to set it.

### 2. S3 Bucket CORS Configuration
The bucket may not have CORS configured to allow requests from velolink.club domain.

### 3. S3 Bucket Policy
The bucket policy might not allow public access to thumbnails/* folder.

## Quick Fix

### Step 1: Make All Thumbnails Public
Run this command on your server:

```bash
cd /path/to/velo/server
npm run fix:thumbnails
```

This will:
- List all files in thumbnails/ folder
- Set ACL to public-read for each file
- Show you which files were updated

### Step 2: Test S3 Access
```bash
npm run test:s3
```

This will check:
- ✅ If objects exist in S3
- ✅ If public URL is accessible
- ✅ If signed URLs work
- ✅ If CORS headers are present

## Manual AWS Console Steps

### 1. Update S3 Bucket CORS

**AWS Console:**
1. Go to AWS S3 Console
2. Select bucket: `amnz-s3-pm-bucket`
3. Click "Permissions" tab
4. Scroll to "Cross-origin resource sharing (CORS)"
5. Click "Edit"
6. Paste this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://velolink.club",
            "https://www.velolink.club"
        ],
        "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
        "MaxAgeSeconds": 3000
    }
]
```

### 2. Update Bucket Policy

**AWS Console:**
1. In the same bucket, stay on "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Add this policy (merge with existing if any):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadThumbnails",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::amnz-s3-pm-bucket/thumbnails/*"
        }
    ]
}
```

### 3. Update Block Public Access Settings

**AWS Console:**
1. In bucket "Permissions" tab
2. Click "Edit" on "Block public access (bucket settings)"
3. Configure:
   - ❌ Block public access to buckets and objects granted through new ACLs: **OFF**
   - ❌ Block public access to buckets and objects granted through any ACLs: **OFF**
   - ✅ Block public access to buckets and objects granted through new public bucket policies: **ON**
   - ❌ Block public and cross-account access to buckets and objects through any public bucket policies: **OFF**

### 4. Verify IAM User Permissions

Ensure your IAM user (`AKIAQQNOG3XPT7T5PBM4`) has these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::amnz-s3-pm-bucket",
                "arn:aws:s3:::amnz-s3-pm-bucket/*"
            ]
        }
    ]
}
```

## Verification

### Test 1: Direct S3 URL
Open in browser:
```
https://amnz-s3-pm-bucket.s3.us-east-1.amazonaws.com/thumbnails/myF3_uVJOG3PcAWy.jpg
```

**Expected:** Image displays ✅

### Test 2: Next.js Optimized URL
Open in browser:
```
https://velolink.club/_next/image?url=https%3A%2F%2Famnz-s3-pm-bucket.s3.us-east-1.amazonaws.com%2Fthumbnails%2FmyF3_uVJOG3PcAWy.jpg&w=128&q=75
```

**Expected:** Image displays ✅

### Test 3: Check Server Logs
Look for these messages when server starts:
```
✓ S3 Service initialized: { region: 'us-east-1', bucket: 'amnz-s3-pm-bucket', credentialsConfigured: true }
✅ AWS Rekognition configured successfully
```

## Code Changes Made

### 1. Updated Next.js Config
- Added specific bucket hostname to `remotePatterns`
- Added `unoptimized: true` for production to bypass Next.js image optimization issues

### 2. Enhanced S3 Service
- Better logging for signed URL generation
- Added validation for bucket configuration
- Improved error messages

### 3. Added Diagnostic Tools
- `npm run test:s3` - Test S3 access
- `npm run fix:thumbnails` - Make all thumbnails public

## Troubleshooting

### Images still not showing after fixes?

1. **Clear CloudFront/CDN cache** if using one
2. **Hard refresh browser** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check browser console** for CORS errors
4. **Verify bucket policy** is applied correctly
5. **Check IAM permissions** for your user

### Getting Access Denied errors?

1. Run `npm run test:s3` to diagnose
2. Check IAM user has `s3:PutObjectAcl` permission
3. Verify Block Public Access settings are correct

### CORS errors in browser?

1. Check CORS configuration in S3 bucket
2. Ensure `AllowedOrigins` includes your domain
3. Restart Next.js after updating config

## Production Deployment Checklist

When deploying to AWS:

- [ ] Updated S3 CORS configuration
- [ ] Updated S3 bucket policy
- [ ] Verified Block Public Access settings
- [ ] Ran `npm run fix:thumbnails` to make existing files public
- [ ] Updated Next.js config with correct bucket name
- [ ] Rebuilt and redeployed Next.js app
- [ ] Tested direct S3 URLs in browser
- [ ] Tested Next.js image URLs in browser
- [ ] Verified server logs show correct S3 configuration
