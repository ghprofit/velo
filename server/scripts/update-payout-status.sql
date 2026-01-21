-- Update creators without payout methods to PENDING status
UPDATE "creator_profiles"
SET "payoutStatus" = 'PENDING'
WHERE "payoutSetupCompleted" = false
  AND "stripeAccountId" IS NULL
  AND "paypalEmail" IS NULL
  AND "payoutStatus" = 'ACTIVE';
