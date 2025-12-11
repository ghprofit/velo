-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('FINANCIAL_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_SPECIALIST', 'ANALYTICS_ADMIN');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INVITED');

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "adminRole" "AdminRole" NOT NULL,
    "status" "AdminStatus" NOT NULL DEFAULT 'INVITED',
    "permDashboard" BOOLEAN NOT NULL DEFAULT true,
    "permCreatorManagement" BOOLEAN NOT NULL DEFAULT false,
    "permContentReview" BOOLEAN NOT NULL DEFAULT false,
    "permFinancialReports" BOOLEAN NOT NULL DEFAULT false,
    "permSystemSettings" BOOLEAN NOT NULL DEFAULT false,
    "permSupportTickets" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastPasswordReset" TIMESTAMP(3),
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_userId_key" ON "admin_profiles"("userId");

-- CreateIndex
CREATE INDEX "admin_profiles_userId_idx" ON "admin_profiles"("userId");

-- CreateIndex
CREATE INDEX "admin_profiles_adminRole_idx" ON "admin_profiles"("adminRole");

-- CreateIndex
CREATE INDEX "admin_profiles_status_idx" ON "admin_profiles"("status");

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
