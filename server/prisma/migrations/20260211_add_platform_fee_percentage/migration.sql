-- Add platformFeePercentage column to purchases table
-- This tracks which platform fee % was applied to each purchase
-- Legacy purchases (before Feb 2026): 10%
-- New purchases (Feb 2026 onwards): 15%

-- Step 1: Add the column with default value of 15 for new purchases
ALTER TABLE "purchases" ADD COLUMN "platformFeePercentage" DOUBLE PRECISION NOT NULL DEFAULT 15;

-- Step 2: Update existing purchases to 10% (all purchases before this migration)
UPDATE "purchases" SET "platformFeePercentage" = 10 WHERE "createdAt" < NOW();

-- Step 3: Add comment to column for documentation
COMMENT ON COLUMN "purchases"."platformFeePercentage" IS 'Platform fee percentage applied to this purchase (10% legacy, 15% current)';
