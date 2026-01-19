# Direct S3 Upload Implementation - API Gateway 10MB Limit Fix

## Problem
API Gateway has a hard 10MB payload limit that cannot be increased. When uploading files larger than 10MB, the request fails with:
- **HTTP 413 Content Too Large** error
- **CORS errors** (because API Gateway doesn't return CORS headers on 413 responses)

## Solution
Implemented **presigned S3 upload URLs** for direct browser-to-S3 uploads, completely bypassing API Gateway.

## Architecture Flow

### Old Flow (Failed for >10MB):
```
Browser → API Gateway (10MB limit) → NestJS → S3
         ❌ 413 Error here
```

### New Flow (Supports up to 500MB):
```
1. Browser → API Gateway → NestJS → Generate Presigned URLs
2. Browser → S3 (Direct Upload) ✅ No API Gateway
3. Browser → API Gateway → NestJS → Confirm Upload
```

## Implementation Details

### Backend Changes

#### 1. S3 Service (`server/src/s3/s3.service.ts`)
- **Updated `getUploadSignedUrl()`**: Added ACL parameter support for public thumbnails
- **New `getPresignedUploadUrl()`**: Generates presigned URLs with auto-generated S3 keys

```typescript
async getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  fileType: 'content' | 'thumbnail',
): Promise<{ uploadUrl: string; key: string }>
```

#### 2. Content Service (`server/src/content/content.service.ts`)
- **New `getPresignedUploadUrls()`**: Validates files and generates presigned URLs for all content items
- **New `confirmDirectUpload()`**: Creates content record after S3 upload completes
- Triggers immediate Rekognition review (no 10-minute delay)

#### 3. DTOs
- **`get-upload-url.dto.ts`**: Validates upload request (title, description, price, file metadata)
- **`confirm-upload.dto.ts`**: Validates upload confirmation (S3 keys, content metadata)

#### 4. Controller (`server/src/content/content.controller.ts`)
- **POST `/content/upload-urls`**: Returns presigned S3 upload URLs
- **POST `/content/confirm-upload`**: Confirms upload and creates content record

### Frontend Changes

#### 1. API Client (`client/src/lib/api-client.ts`)
- **`contentApi.getUploadUrls()`**: Request presigned URLs from backend
- **`contentApi.confirmUpload()`**: Notify backend when S3 upload completes

#### 2. Upload Page (`client/src/app/creator/upload/page.tsx`)
Completely redesigned upload flow:

**Progress Stages:**
1. **5%**: Request presigned URLs from backend
2. **10%**: Upload thumbnail to S3
3. **10-90%**: Upload content files to S3 (with progress tracking)
4. **95%**: Confirm upload with backend
5. **100%**: Content created, triggers immediate review

**Features:**
- Direct S3 upload using native XMLHttpRequest
- Per-file progress tracking
- Supports files up to 500MB each
- Total upload progress calculation across multiple files
- Proper error handling for S3 upload failures

## File Size Limits

| Component | Limit | Reason |
|-----------|-------|--------|
| **API Gateway** | 10MB | Hard AWS limit (cannot be changed) |
| **S3 Upload** | 500MB | Configured in NestJS validation |
| **Total Upload** | 500MB per file | 10 files max = 5GB total |

## Upload Flow Example

```typescript
// 1. Get presigned URLs
const response = await contentApi.getUploadUrls({
  title: "My Video",
  description: "Description",
  price: 9.99,
  thumbnailFileName: "thumbnail.jpg",
  thumbnailContentType: "image/jpeg",
  thumbnailFileSize: 150000,
  contentFiles: [{
    fileName: "video.mp4",
    contentType: "video/mp4",
    fileSize: 50000000, // 50MB
    type: "VIDEO"
  }]
});

// 2. Upload directly to S3 (bypasses API Gateway)
await fetch(response.data.thumbnailUrl.uploadUrl, {
  method: 'PUT',
  body: thumbnailBlob,
  headers: { 'Content-Type': 'image/jpeg' }
});

await fetch(response.data.contentUrls[0].uploadUrl, {
  method: 'PUT',
  body: videoFile,
  headers: { 'Content-Type': 'video/mp4' }
});

// 3. Confirm upload
await contentApi.confirmUpload({
  contentId: response.data.contentId,
  title: "My Video",
  description: "Description",
  price: 9.99,
  thumbnailS3Key: response.data.thumbnailUrl.key,
  items: [{
    s3Key: response.data.contentUrls[0].key,
    type: "VIDEO",
    fileSize: 50000000
  }]
});
```

## Benefits

✅ **No API Gateway 10MB limit** - Files up to 500MB supported
✅ **Faster uploads** - Direct browser-to-S3 (no proxy through backend)
✅ **Better progress tracking** - Real-time per-file progress
✅ **Lower backend load** - Backend only generates URLs, not handling file bytes
✅ **Cost efficient** - No data transfer through EC2 instance
✅ **Scalable** - S3 handles concurrent uploads natively

## Security

- Presigned URLs expire after **1 hour** (3600 seconds)
- URLs are single-use and specific to the S3 key
- Backend validates file sizes before generating URLs
- Backend verifies creator profile ownership
- S3 ACLs enforced:
  - **Thumbnails**: `public-read` (accessible via public URL)
  - **Content**: `private` (requires signed URL to access)

## Testing

Both builds successful:
- ✅ Server: `npm run build` (no errors)
- ✅ Client: `npm run build` (no errors, only warnings)

## Deployment Notes

1. **No .env changes required** - Uses existing S3 configuration
2. **No database migrations** - Uses existing schema
3. **Backward compatible** - Old `/content/multipart` endpoint still works
4. **Deploy both** - Server and client must be deployed together
5. **CORS configured** - S3 bucket already has CORS for `velolink.club`

## Next Steps

1. Deploy server to production
2. Deploy client to production
3. Test with files >10MB to verify fix
4. Monitor S3 upload logs in CloudWatch
5. Optional: Add chunked upload for files >500MB (multipart S3 upload)
