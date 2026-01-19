# AWS S3 Configuration for VeloLink

## Issues Fixed:
1. ✅ S3 bucket name variable mismatch (AWS_S3_BUCKET vs AWS_S3_BUCKET_NAME)
2. ✅ Better error handling for signed URL generation
3. ✅ Recognition service fallback when AWS fails

## Required S3 Bucket Configuration

### 1. CORS Configuration
Your S3 bucket needs proper CORS settings for signed URLs to work in browsers.

Go to: AWS S3 Console → Your Bucket (`amnz-s3-pm-bucket`) → Permissions → CORS

**Add this CORS configuration:**
```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD",
            "PUT",
            "POST"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://velolink.club",
            "https://www.velolink.club",
            "https://*.amplifyapp.com"
        ],
        "ExposeHeaders": [
            "ETag",
            "Content-Length",
            "Content-Type"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### 2. Bucket Policy (for signed URLs)
Make sure your bucket policy allows the IAM user to generate signed URLs.

Go to: AWS S3 Console → Your Bucket → Permissions → Bucket Policy

**Required permissions:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowSignedURLAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::amnz-s3-pm-bucket/*"
        },
        {
            "Sid": "AllowPublicThumbnails",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::amnz-s3-pm-bucket/thumbnails/*"
        }
    ]
}
```

### 3. IAM User Permissions
Your IAM user (AKIAQQNOG3XPT7T5PBM4) needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::amnz-s3-pm-bucket",
                "arn:aws:s3:::amnz-s3-pm-bucket/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "rekognition:DetectModerationLabels",
                "rekognition:StartContentModeration",
                "rekognition:GetContentModeration"
            ],
            "Resource": "*"
        }
    ]
}
```

### 4. Block Public Access Settings
Go to: AWS S3 Console → Your Bucket → Permissions → Block Public Access

**Configure these settings:**
- ✅ Block public access to buckets and objects granted through new access control lists (ACLs): OFF (for thumbnails)
- ✅ Block public access to buckets and objects granted through any access control lists (ACLs): OFF
- ✅ Block public access to buckets and objects granted through new public bucket or access point policies: ON
- ✅ Block public and cross-account access to buckets and objects through any public bucket or access point policies: OFF

### 5. Verify Setup
After configuration, restart the server and check the logs:
```bash
npm run dev
```

Look for:
```
✓ S3 Service initialized: { region: 'us-east-1', bucket: 'amnz-s3-pm-bucket', credentialsConfigured: true }
✅ AWS Rekognition configured successfully
```

### Troubleshooting

**Images not showing:**
- Check browser console for CORS errors
- Verify signed URL is being generated (check server logs)
- Ensure bucket policy allows GetObject

**Videos stuck at pending:**
- Check AWS Rekognition configuration
- Verify IAM user has rekognition:DetectModerationLabels permission
- Check server logs for Rekognition errors

**Local works but server doesn't:**
- Verify .env file on server has correct AWS credentials
- Check AWS region matches (us-east-1)
- Ensure bucket name is correct (amnz-s3-pm-bucket)
