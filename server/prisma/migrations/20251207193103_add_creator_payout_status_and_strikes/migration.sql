-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'SUSPENDED');

-- AlterTable
ALTER TABLE "creator_profiles" ADD COLUMN     "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "policyStrikes" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "creator_profiles_payoutStatus_idx" ON "creator_profiles"("payoutStatus");
