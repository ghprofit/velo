-- Add missing rekognition columns to content table
ALTER TABLE content 
ADD COLUMN IF NOT EXISTS "rekognitionJobId" TEXT,
ADD COLUMN IF NOT EXISTS "rekognitionJobStatus" TEXT,
ADD COLUMN IF NOT EXISTS "rekognitionJobStartedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rekognitionJobCompletedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "moderationCheckType" TEXT;

-- Add index for rekognitionJobStatus
CREATE INDEX IF NOT EXISTS "content_rekognitionJobStatus_idx" ON content("rekognitionJobStatus");
