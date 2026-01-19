# Fix S3 Thumbnail Public Access (403 Forbidden Error)

## Problem
Thumbnails are returning **403 Forbidden** even though code sets `ACL: 'public-read'` during upload.

**Tested URL:**
```
https://amnz-s3-pm-bucket.s3.us-east-1.amazonaws.com/thumbnails/myF3_uVJOG3PcAWy.jpg
Response: 403 Forbidden
```

## Root Cause
**S3 Block Public Access** settings are enabled at the bucket level, which overrides individual object ACLs.

## Solution Steps

### Step 1: Disable Block Public Access for Thumbnails

Go to: **AWS S3 Console** → **amnz-s3-pm-bucket** → **Permissions** → **Block public access (bucket settings)**

Click **Edit** and configure as follows:

- ☑️ **Block public access to buckets and objects granted through new access control lists (ACLs)** - UNCHECK THIS
- ☑️ **Block public access to buckets and objects granted through any access control lists (ACLs)** - UNCHECK THIS  
- ☑️ Block public access to buckets and objects granted through new public bucket or access point policies - KEEP CHECKED
- ☑️ Block public and cross-account access to buckets and objects through any public bucket or access point policies - KEEP CHECKED

Click **Save changes** and confirm by typing "confirm".

### Step 2: Add Bucket Policy for Thumbnails

Go to: **AWS S3 Console** → **amnz-s3-pm-bucket** → **Permissions** → **Bucket policy**

Add this policy to allow public read access ONLY to thumbnails folder:

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

This allows public read access ONLY to objects in the `thumbnails/` folder, keeping content in `content/` folder private.

### Step 3: Update Existing Thumbnails ACL

Run the existing script to set all thumbnails to public-read:

```bash
cd server
npm run fix:thumbnails
```

This will:
1. List all objects in the `thumbnails/` folder
2. Update each object's ACL to `public-read`
3. Report success/failure for each file

### Step 4: Verify Fix

Test a thumbnail URL in your browser:
```
https://amnz-s3-pm-bucket.s3.us-east-1.amazonaws.com/thumbnails/[YOUR-THUMBNAIL-KEY]
```

Should return **200 OK** and display the image.

Or use PowerShell:
```powershell
Invoke-WebRequest -Method Head -Uri "https://amnz-s3-pm-bucket.s3.us-east-1.amazonaws.com/thumbnails/myF3_uVJOG3PcAWy.jpg"
```

Should return `StatusCode: 200` instead of 403.

## Alternative: Use CloudFront Distribution

If you don't want to make bucket objects public via ACLs, use CloudFront:

1. Create CloudFront distribution with S3 origin
2. Set Origin Access Identity (OAI) or Origin Access Control (OAC)
3. Update bucket policy to allow CloudFront access
4. Update `thumbnailUrl` in database to use CloudFront URL instead of S3 direct URL
5. Keep content private and serve via signed CloudFront URLs

## Security Notes

✅ **Safe**: Only `thumbnails/*` folder is public (bucket policy restricts to this path)
✅ **Safe**: Content files in `content/*` remain private, accessible only via signed URLs
✅ **Safe**: User profile images, creator profiles - these should be public
⚠️ **Warning**: Do not make entire bucket public - only thumbnails folder

## Troubleshooting

### Still getting 403 after changes?
1. Wait 1-2 minutes for AWS to propagate changes
2. Clear browser cache
3. Try incognito/private window
4. Check CloudFlare cache if using CDN

### ACL not working?
- Ensure "Block public access via ACLs" is UNCHECKED
- Verify bucket policy allows `s3:GetObject` for thumbnails
- Check IAM user has `s3:PutObjectAcl` permission

### Bucket policy not saving?
- Ensure JSON is valid (use AWS policy generator)
- Check bucket ARN is correct
- Verify you have bucket permissions to edit policy

## Related Files
- `server/src/s3/s3.service.ts` - Sets ACL during upload
- `server/scripts/make-thumbnails-public.ts` - Batch update existing thumbnails
- `server/AWS_S3_SETUP.md` - Complete S3 configuration guide

