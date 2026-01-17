# PowerShell script to run SQL migration
# This updates APPROVED payout requests to PROCESSING

$env:PGPASSWORD = "npg_DeqHGsRhp6L7"

Write-Host "Running migration to update APPROVED payout requests..." -ForegroundColor Cyan
Write-Host ""

# SQL commands
$sql = @"
-- Update PayoutRequest status from APPROVED to PROCESSING
UPDATE payout_requests 
SET status = 'PROCESSING', 
    "updatedAt" = NOW()
WHERE status = 'APPROVED';

-- Update linked Payout status from PENDING to PROCESSING
UPDATE payouts p
SET status = 'PROCESSING',
    "updatedAt" = NOW()
FROM payout_requests pr
WHERE pr."payoutId" = p.id
  AND pr.status = 'PROCESSING'
  AND p.status = 'PENDING';

-- Show results
SELECT 'Updated PayoutRequests:' AS info, COUNT(*)::text AS count
FROM payout_requests
WHERE status = 'PROCESSING' AND "updatedAt" > NOW() - INTERVAL '10 seconds'
UNION ALL
SELECT 'Updated Payouts:' AS info, COUNT(*)::text AS count
FROM payouts
WHERE status = 'PROCESSING' AND "updatedAt" > NOW() - INTERVAL '10 seconds';
"@

# Save SQL to temp file
$sql | Out-File -FilePath "temp-migration.sql" -Encoding UTF8

# Run psql command
try {
    psql -h ep-wandering-meadow-adz3ni25-pooler.c-2.us-east-1.aws.neon.tech `
         -p 5432 `
         -U neondb_owner `
         -d velo `
         -f temp-migration.sql

    Write-Host ""
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Migration failed: $_" -ForegroundColor Red
} finally {
    # Clean up temp file
    if (Test-Path "temp-migration.sql") {
        Remove-Item "temp-migration.sql"
    }
    Remove-Item Env:\PGPASSWORD
}
