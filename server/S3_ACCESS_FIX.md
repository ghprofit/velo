# S3 Access Denied Fix - Thumbnail URLs Returning 403

## Problem

When pasting thumbnail URLs from the database directly into the browser, you got:

```xml
<Error>
  <Code>AccessDenied</Code>
  <Message>Access Denied</Message>
  ...
</Error>
```

## Root Cause

**Files were uploaded as private to S3**

In [s3.service.ts:72](src/s3/s3.service.ts#L72), the ACL (Access Control List) was commented out:

```typescript
// Upload to S3
const upload = new Upload({
  client: this.s3Client,
  params: {
    Bucket: this.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    // Make files publicly readable (adjust based on your security needs)
    // ACL: 'public-read',  // ❌ This was commented out!
  },
});
```

**Default S3 behavior:** Files are uploaded as **private** unless you explicitly set permissions.

**Result:** Direct S3 URLs like `https://bucket.s3.region.amazonaws.com/key` return 403 Access Denied.

---

## The Fix: Signed URLs (Recommended Approach)

Instead of making files public, we now generate **temporary signed URLs** that expire after 24 hours.

### ✅ What Changed

#### 1. Buyer Service - Public Content Preview

**File:** `server/src/buyer/buyer.service.ts`

**Changes:**
- Injected `S3Service`
- Generate signed URL for thumbnails in `getContentDetails()`
- Generate signed URLs for content items in `getContentAccess()`

```typescript
// Generate signed URL for thumbnail (valid for 24 hours)
const thumbnailUrl = content.s3Key
  ? await this.s3Service.getSignedUrl(content.s3Key, 86400)
  : content.thumbnailUrl;
```

**Effect:** Buyers now get temporary URLs that work for 24 hours.

#### 2. Content Service - Creator Dashboard

**File:** `server/src/content/content.service.ts`

**Changes:**
- Added helper method `getSignedThumbnailUrl()`
- Updated `getCreatorContent()` to return signed URLs for all content
- Updated `getContentById()` to return signed URL for thumbnail

```typescript
private async getSignedThumbnailUrl(s3Key: string, thumbnailUrl: string): Promise<string> {
  if (s3Key) {
    try {
      return await this.s3Service.getSignedUrl(s3Key, 86400); // 24 hours
    } catch (error) {
      console.error('Failed to generate signed URL, using fallback:', error);
      return thumbnailUrl;
    }
  }
  return thumbnailUrl;
}
```

**Effect:** Creators see working thumbnail URLs in their dashboard.

#### 3. Buyer Module - Dependency Injection

**File:** `server/src/buyer/buyer.module.ts`

**Change:** Added `S3Module` to imports

```typescript
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [PrismaModule, StripeModule, EmailModule, S3Module],  // ✅ Added S3Module
  ...
})
```

---

## How Signed URLs Work

### What is a Signed URL?

A signed URL is a temporary URL that includes authentication parameters in the query string:

```
https://bucket.s3.region.amazonaws.com/file.jpg?
  X-Amz-Algorithm=AWS4-HMAC-SHA256&
  X-Amz-Credential=...&
  X-Amz-Date=20250117T120000Z&
  X-Amz-Expires=86400&
  X-Amz-SignedHeaders=host&
  X-Amz-Signature=...
```

### Benefits

✅ **Secure** - Files stay private, only authorized users get URLs
✅ **Time-limited** - URLs expire after 24 hours (configurable)
✅ **No bucket policy changes** - Works with default private buckets
✅ **Audit trail** - AWS logs who generated URLs and when

### Limitations

⚠️ **URLs expire** - After 24 hours, URLs stop working
⚠️ **Can't cache forever** - CDNs can cache for a shorter time
⚠️ **Slightly longer URLs** - Due to signature parameters

---

## Alternative: Public Bucket (Not Recommended for Content Platform)

If you want files publicly accessible forever, you can uncomment the ACL line:

### Option A: Enable ACL in Code

**File:** `server/src/s3/s3.service.ts`

Uncomment line 72:
```typescript
const upload = new Upload({
  client: this.s3Client,
  params: {
    Bucket: this.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read',  // ✅ Uncomment this
  },
});
```

### Option B: Configure S3 Bucket for Public Access

1. **Go to AWS S3 Console**
2. **Select your bucket** (e.g., `velo-content`)
3. **Click "Permissions" tab**
4. **Edit "Block Public Access"**:
   - Uncheck "Block all public access"
   - Save changes
5. **Add Bucket Policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::velo-content/*"
       }
     ]
   }
   ```

6. **Enable ACLs**:
   - Go to "Object Ownership"
   - Edit settings
   - Select "ACLs enabled"
   - Save changes

⚠️ **Warning:** This makes ALL files in your bucket publicly accessible. Not recommended for a content platform where you want to control access.

---

## Testing the Fix

### 1. Check Signed URL Generation

Run this in your server directory:

```bash
node -e "
const { S3Service } = require('./dist/s3/s3.service');
const { ConfigService } = require('@nestjs/config');

const config = new ConfigService();
const s3 = new S3Service(config);

s3.getSignedUrl('thumbnails/test.jpg', 3600)
  .then(url => console.log('Signed URL:', url))
  .catch(err => console.error('Error:', err));
"
```

### 2. Test via API

#### Get content details (buyer view):
```bash
curl http://localhost:8000/api/buyer/content/YOUR_CONTENT_ID
```

Response should include a signed `thumbnailUrl`:
```json
{
  "id": "abc123",
  "title": "My Content",
  "thumbnailUrl": "https://bucket.s3.region.amazonaws.com/file.jpg?X-Amz-Algorithm=...",
  ...
}
```

#### Get creator's content:
```bash
curl http://localhost:8000/api/content/my-content \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

All thumbnails should have signed URLs.

### 3. Test in Browser

1. **Upload new content** via `/creator/upload`
2. **View content** at `/c/[id]`
3. **Check thumbnail loads** without 403 error
4. **Inspect Network tab** - thumbnail URL should have signature parameters

---

## URL Expiry Management

### Current Settings

- **Expiry time:** 24 hours (86400 seconds)
- **Use case:** Good for daily browsing

### Adjusting Expiry Time

Change the second parameter in `getSignedUrl()`:

```typescript
// 1 hour
await this.s3Service.getSignedUrl(key, 3600)

// 24 hours (current)
await this.s3Service.getSignedUrl(key, 86400)

// 7 days
await this.s3Service.getSignedUrl(key, 604800)
```

### Refreshing Expired URLs

When URLs expire, users need to refresh the page to get new signed URLs.

**For longer-lived access:**
- Consider caching signed URLs with shorter TTL
- Regenerate URLs when they're about to expire
- Implement URL refresh logic in the client

---

## Security Considerations

### ✅ Current Setup (Secure)

- Files are private in S3
- Only authorized requests get signed URLs
- URLs expire after 24 hours
- Can track who generated URLs via CloudTrail

### ⚠️ Public Bucket Risks

If you make the bucket public:
- Anyone can access any file if they know the URL
- No access control or expiry
- Can't revoke access to specific content
- Hard to track unauthorized access

**Recommendation:** Keep using signed URLs for a content platform.

---

## Files Modified

| File | Changes |
|------|---------|
| `server/src/buyer/buyer.service.ts` | Added S3Service injection, generate signed URLs in `getContentDetails()` and `getContentAccess()` |
| `server/src/content/content.service.ts` | Added `getSignedThumbnailUrl()` helper, updated `getCreatorContent()` and `getContentById()` |
| `server/src/buyer/buyer.module.ts` | Added S3Module to imports |

---

## Environment Variables

Make sure these are set in your `.env`:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=velo-content

# AWS SES Configuration (for emails)
SES_FROM_EMAIL=josephkuttor730@gmail.com
SES_FROM_NAME=VeloLink
```

---

## Troubleshooting

### Issue: Still getting Access Denied

**Check:**
1. AWS credentials are correct in `.env`
2. IAM user has `s3:GetObject` permission
3. S3Service is properly injected in the service
4. Signed URL is being generated (check API response)

### Issue: URLs expire too quickly

**Fix:** Increase expiry time in `getSignedUrl()` calls:
```typescript
await this.s3Service.getSignedUrl(key, 604800) // 7 days
```

### Issue: Signed URL generation is slow

**Optimization:**
- Generate URLs in parallel using `Promise.all()`
- Cache signed URLs with short TTL
- Consider using CloudFront signed URLs for better performance

---

## Production Checklist

- [ ] AWS credentials configured in `.env`
- [ ] S3 bucket created and accessible
- [ ] IAM user has correct permissions (`s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`)
- [ ] Signed URLs working for thumbnails
- [ ] Signed URLs working for content items
- [ ] Test URL expiry behavior
- [ ] Monitor S3 costs (signed URL generation is free, but storage and data transfer cost money)

---

## Cost Implications

### S3 Pricing

- **Storage:** ~$0.023/GB per month
- **GET requests:** $0.0004 per 1,000 requests
- **Data transfer out:** $0.09/GB (first 10 TB)

### Signed URLs

- **Generation:** FREE (no AWS charges)
- **Bandwidth:** Charges apply when files are downloaded

**Example:** 1000 content items with 10 views each per month
- 10,000 signed URL generations: FREE
- 10,000 GET requests: ~$0.004
- 100 GB data transfer: ~$9.00

**Total:** ~$9.00/month (mainly data transfer)

---

## Summary

✅ **Fixed:** S3 Access Denied errors
✅ **Method:** Signed URLs instead of public files
✅ **Security:** Files stay private, temporary access granted
✅ **Expiry:** 24 hours (configurable)
✅ **Tested:** TypeScript compiles successfully

**Your thumbnails and content should now load without Access Denied errors!** 🎉
