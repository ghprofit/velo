# Content Safety Quick Start Guide

Check if images/videos contain unsafe content in 5 minutes!

## What This Does

Flags content containing:
- Explicit Nudity
- Violence
- Visually Disturbing Content
- Drugs, Alcohol, Tobacco
- Hate Symbols
- And more...

## Setup (2 minutes)

### Step 1: AWS Credentials (Optional for dev)

Without credentials, the service runs in **simulation mode** (always returns safe).

For production:
1. Go to [AWS Console](https://console.aws.amazon.com) > IAM > Users
2. Create Access Key with `AmazonRekognitionFullAccess`
3. Add to `.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Step 2: Start Server

```bash
npm run start:dev
```

## Test It (3 minutes)

### Health Check

```bash
curl http://localhost:3000/recognition/health
```

### Check Image Safety (URL)

```bash
curl -X POST http://localhost:3000/recognition/check \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "url",
      "data": "https://images.unsplash.com/photo-1543466835-00a7907e9de1"
    }
  }'
```

Response:
```json
{
  "success": true,
  "isSafe": true,
  "confidence": 100,
  "flaggedCategories": [],
  "message": "Content is safe"
}
```

### Quick Check (Boolean Only)

```bash
curl -X POST http://localhost:3000/recognition/is-safe \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "type": "url",
      "data": "https://example.com/image.jpg"
    }
  }'
```

Response:
```json
{
  "success": true,
  "isSafe": true,
  "message": "Content is safe"
}
```

### Check Multiple Images

```bash
curl -X POST http://localhost:3000/recognition/check-batch \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "img1",
        "content": { "type": "url", "data": "https://example.com/1.jpg" }
      },
      {
        "id": "img2",
        "content": { "type": "url", "data": "https://example.com/2.jpg" }
      }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "totalItems": 2,
  "safeCount": 2,
  "unsafeCount": 0,
  "allSafe": true,
  "message": "2/2 items are safe"
}
```

### See All Flagged Categories

```bash
curl http://localhost:3000/recognition/categories
```

## API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/recognition/check` | POST | Full safety check with details |
| `/recognition/is-safe` | POST | Quick true/false check |
| `/recognition/check-batch` | POST | Check multiple images |
| `/recognition/check-video` | POST | Start video safety analysis |
| `/recognition/video/:jobId` | GET | Get video analysis results |
| `/recognition/categories` | GET | List flaggable categories |
| `/recognition/health` | GET | Service health check |

## Content Sources

### Base64 (for uploads)
```json
{
  "type": "base64",
  "data": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### URL (for web images)
```json
{
  "type": "url",
  "data": "https://example.com/image.jpg"
}
```

### S3 (for stored files)
```json
{
  "type": "s3",
  "data": "folder/image.jpg",
  "bucket": "my-bucket"
}
```

## Use in Your Code

```typescript
import { RecognitionService } from './recognition/recognition.service';

@Injectable()
export class MyService {
  constructor(private readonly recognitionService: RecognitionService) {}

  async uploadImage(base64Image: string) {
    // Check safety before upload
    const isSafe = await this.recognitionService.isContentSafe(
      { type: 'base64', data: base64Image },
      50, // minConfidence
    );

    if (!isSafe) {
      throw new Error('Image contains inappropriate content');
    }

    // Proceed with upload...
  }
}
```

## Common Issues

### "AWS credentials not found"
This is fine for development! Service runs in simulation mode.

For production, add credentials to `.env`.

### "Content is always safe"
You're in simulation mode (no AWS credentials). This is expected for development.

### "Video safety check requires S3 source"
Videos must be stored in S3. You can't use base64 or URL for videos.

## Pricing

- ~$1 per 1,000 images
- Free tier: 5,000 images/month (first 12 months)

## Next Steps

1. Add credentials for production use
2. Adjust `minConfidence` threshold (50-80 recommended)
3. Integrate into your upload/validation flow
4. Set up monitoring for flagged content

See [README.md](README.md) for complete documentation.
