-- Migration: Update PENDING_REVIEW content to APPROVED
-- This makes all content immediately visible to buyers and creators

-- Check current status distribution
SELECT status, COUNT(*) as count
FROM "Content"
GROUP BY status;

-- Update all PENDING_REVIEW content to APPROVED
UPDATE "Content"
SET status = 'APPROVED'
WHERE status = 'PENDING_REVIEW';

-- Show updated status distribution
SELECT status, COUNT(*) as count
FROM "Content"
GROUP BY status;

-- Show the updated content details
SELECT id, title, status, "isPublished", "createdAt"
FROM "Content"
WHERE status = 'APPROVED'
ORDER BY "createdAt" DESC;
