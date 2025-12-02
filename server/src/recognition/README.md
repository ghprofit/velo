# Content Safety Module

A content safety module for NestJS using AWS Rekognition to detect explicit, violent, and disturbing content in images and videos.

## Purpose

This module **only** checks if content is safe or not. It flags:
- Explicit Nudity
- Suggestive Content
- Violence
- Visually Disturbing Content
- Rude Gestures
- Drugs
- Tobacco
- Alcohol
- Gambling
- Hate Symbols

## Features

- **Single Image Safety Check** - Check if an image contains unsafe content
- **Quick Safety Check** - Simple true/false response
- **Batch Safety Check** - Check multiple images at once
- **Video Safety Analysis** - Async video content moderation
- **Multiple Content Sources** - Base64, URL, or S3
- **Development Mode** - Simulated results without AWS credentials

## Installation

```bash
npm install @aws-sdk/client-rekognition
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_S3_BUCKET=your_s3_bucket_name_here
```

**Note:** Without credentials, the service runs in simulation mode (always returns safe).

### AWS IAM Permissions

Your IAM user needs:
- `AmazonRekognitionFullAccess` (or `rekognition:DetectModerationLabels`, `rekognition:StartContentModeration`, `rekognition:GetContentModeration`)
- `AmazonS3ReadOnlyAccess` (if using S3 sources)

## API Endpoints

### Check Content Safety
**POST** `/recognition/check`

Returns detailed safety analysis including flagged categories.

```bash
curl -X POST http://localhost:3000/recognition/check \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "url",
      "data": "https://example.com/image.jpg"
    },
    "minConfidence": 50
  }'
```

**Response:**
```json
{
  "success": true,
  "isSafe": true,
  "confidence": 100,
  "flaggedCategories": [],
  "moderationLabels": [],
  "message": "Content is safe",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Unsafe content response:**
```json
{
  "success": true,
  "isSafe": false,
  "confidence": 95.5,
  "flaggedCategories": ["Violence", "Visually Disturbing"],
  "moderationLabels": [
    {
      "name": "Graphic Violence Or Gore",
      "confidence": 95.5,
      "parentName": "Violence",
      "taxonomyLevel": 2
    }
  ],
  "message": "Content flagged for: Violence, Visually Disturbing",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Quick Safety Check
**POST** `/recognition/is-safe`

Returns simple true/false.

```bash
curl -X POST http://localhost:3000/recognition/is-safe \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "base64",
      "data": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "isSafe": true,
  "message": "Content is safe",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Batch Safety Check
**POST** `/recognition/check-batch`

Check multiple images at once.

```bash
curl -X POST http://localhost:3000/recognition/check-batch \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "image-1",
        "content": {
          "type": "url",
          "data": "https://example.com/image1.jpg"
        }
      },
      {
        "id": "image-2",
        "content": {
          "type": "url",
          "data": "https://example.com/image2.jpg"
        }
      }
    ],
    "minConfidence": 50
  }'
```

**Response:**
```json
{
  "success": true,
  "totalItems": 2,
  "safeCount": 1,
  "unsafeCount": 1,
  "allSafe": false,
  "results": [
    {
      "id": "image-1",
      "isSafe": true,
      "flaggedCategories": []
    },
    {
      "id": "image-2",
      "isSafe": false,
      "flaggedCategories": ["Explicit Nudity"]
    }
  ],
  "message": "1/2 items are safe",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Video Safety Check (Async)
**POST** `/recognition/check-video`

Start async video analysis. Videos must be in S3.

```bash
curl -X POST http://localhost:3000/recognition/check-video \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "s3",
      "data": "videos/myvideo.mp4",
      "bucket": "my-bucket"
    },
    "minConfidence": 50
  }'
```

**Response:**
```json
{
  "success": true,
  "jobId": "abc123xyz",
  "status": "IN_PROGRESS",
  "message": "Video safety check started. Poll /recognition/video/:jobId for results.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Video Results
**GET** `/recognition/video/:jobId`

Poll for video analysis results.

```bash
curl http://localhost:3000/recognition/video/abc123xyz
```

**Response:**
```json
{
  "success": true,
  "jobId": "abc123xyz",
  "status": "SUCCEEDED",
  "isSafe": false,
  "unsafeSegmentsCount": 2,
  "unsafeSegments": [
    {
      "timestampMs": 15000,
      "label": "Violence",
      "confidence": 89.5
    },
    {
      "timestampMs": 45000,
      "label": "Explicit Nudity",
      "confidence": 92.3
    }
  ],
  "message": "Video contains 2 unsafe segments",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Safety Categories
**GET** `/recognition/categories`

List all categories that can be flagged.

```bash
curl http://localhost:3000/recognition/categories
```

**Response:**
```json
{
  "success": true,
  "categories": [
    "Explicit Nudity",
    "Suggestive",
    "Violence",
    "Visually Disturbing",
    "Rude Gestures",
    "Drugs",
    "Tobacco",
    "Alcohol",
    "Gambling",
    "Hate Symbols"
  ],
  "description": "Content will be flagged if it contains any of these categories",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Health Check
**GET** `/recognition/health`

```bash
curl http://localhost:3000/recognition/health
```

**Response:**
```json
{
  "status": "ok",
  "configured": true,
  "region": "us-east-1",
  "service": "Content Safety Service",
  "provider": "AWS Rekognition",
  "purpose": "Detect explicit, violent, and disturbing content",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Content Source Types

### Base64
```json
{
  "type": "base64",
  "data": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### URL
```json
{
  "type": "url",
  "data": "https://example.com/image.jpg"
}
```

### S3
```json
{
  "type": "s3",
  "data": "path/to/image.jpg",
  "bucket": "my-bucket"
}
```

## Using in Your Code

### Check if Image is Safe

```typescript
import { Injectable } from '@nestjs/common';
import { RecognitionService } from './recognition/recognition.service';

@Injectable()
export class UploadService {
  constructor(private readonly recognitionService: RecognitionService) {}

  async uploadImage(imageBase64: string): Promise<{ url: string }> {
    // Check if content is safe before uploading
    const isSafe = await this.recognitionService.isContentSafe(
      { type: 'base64', data: imageBase64 },
      50,
    );

    if (!isSafe) {
      throw new Error('Image contains inappropriate content');
    }

    // Continue with upload...
    return { url: 'uploaded-url' };
  }
}
```

### Get Detailed Safety Information

```typescript
async validateProfilePhoto(imageBase64: string) {
  const result = await this.recognitionService.checkImageSafety(
    { type: 'base64', data: imageBase64 },
    50,
  );

  if (!result.isSafe) {
    return {
      valid: false,
      reason: `Image flagged for: ${result.flaggedCategories.join(', ')}`,
      categories: result.flaggedCategories,
    };
  }

  return { valid: true };
}
```

### Batch Check Multiple Images

```typescript
async validateBatchImages(images: Array<{ id: string; base64: string }>) {
  const items = images.map((img) => ({
    id: img.id,
    content: { type: 'base64' as const, data: img.base64 },
  }));

  const results = await this.recognitionService.checkBatchSafety(items, 50);

  // Filter out unsafe images
  const safeImageIds = results.results
    .filter((r) => r.isSafe)
    .map((r) => r.id);

  return {
    safeImages: safeImageIds,
    unsafeCount: results.unsafeCount,
  };
}
```

## Development Mode

Without AWS credentials, the service returns **simulated safe results**:

```typescript
// Simulated response (always safe)
{
  "isSafe": true,
  "confidence": 100,
  "flaggedCategories": [],
  "moderationLabels": []
}
```

Check logs for: `[RecognitionService] [SIMULATED] Image safety check`

## Pricing

AWS Rekognition content moderation pricing:
- ~$1 per 1,000 images analyzed
- ~$0.10 per minute of video

Free tier: 5,000 images/month for first 12 months.

See [AWS Rekognition Pricing](https://aws.amazon.com/rekognition/pricing/)

## Limitations

### Images
- Max size: 5MB (15MB for S3)
- Formats: JPEG, PNG
- Min dimensions: 80x80 pixels

### Videos
- Must be in S3
- Max size: 10GB
- Max length: 10 hours
- Formats: MPEG-4, MOV

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "isSafe": false,
  "error": "Safety check failed: Invalid image format",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Common Use Cases

1. **User-Generated Content Moderation** - Block inappropriate images/videos before publishing
2. **Profile Photo Validation** - Ensure profile photos are appropriate
3. **Media Upload Filtering** - Pre-screen all uploads for unsafe content
4. **Compliance Enforcement** - Automatically enforce content policies

## Production Checklist

- [ ] Configure AWS credentials with minimal permissions
- [ ] Set appropriate minConfidence threshold (50-80 recommended)
- [ ] Implement rate limiting on endpoints
- [ ] Add CloudWatch monitoring
- [ ] Set up cost alerts
- [ ] Handle video job timeouts
- [ ] Implement retry logic for failures
- [ ] Cache results if needed

## Resources

- [AWS Rekognition Content Moderation](https://docs.aws.amazon.com/rekognition/latest/dg/moderation.html)
- [Moderation Label Categories](https://docs.aws.amazon.com/rekognition/latest/dg/moderation.html#moderation-api)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
