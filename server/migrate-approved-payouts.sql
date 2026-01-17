-- Migration to fix existing APPROVED payout requests
-- This updates APPROVED status to PROCESSING for both PayoutRequests and linked Payouts

BEGIN;

-- Update PayoutRequest status from APPROVED to PROCESSING
UPDATE payout_requests 
SET status = 'PROCESSING', 
    "updatedAt" = NOW()
WHERE status = 'APPROVED';

-- Update linked Payout status from PENDING to PROCESSING for approved requests
UPDATE payouts p
SET status = 'PROCESSING',
    "updatedAt" = NOW()
FROM payout_requests pr
WHERE pr."payoutId" = p.id
  AND pr.status = 'PROCESSING'  -- Already updated above
  AND p.status = 'PENDING';

-- Show results
SELECT 'PayoutRequests updated' AS action, COUNT(*) AS count
FROM payout_requests
WHERE status = 'PROCESSING' AND "updatedAt" > NOW() - INTERVAL '1 minute'
UNION ALL
SELECT 'Payouts updated' AS action, COUNT(*) AS count
FROM payouts
WHERE status = 'PROCESSING' AND "updatedAt" > NOW() - INTERVAL '1 minute';

COMMIT;
