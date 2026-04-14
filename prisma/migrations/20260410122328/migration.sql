-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('AVAILABLE', 'SECURITY_GENERATED', 'SENT', 'USED', 'BLOCKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeliveryChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "alumni_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "designation" TEXT,
    "companyName" TEXT,
    "universityName" TEXT,
    "department" TEXT,
    "program" TEXT,
    "passingYear" INTEGER,
    "batch" TEXT,
    "studentId" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "presentAddress" TEXT,
    "permanentAddress" TEXT,
    "bio" TEXT,
    "linkedinUrl" TEXT,
    "facebookUrl" TEXT,
    "websiteUrl" TEXT,
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumni_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "securityHash" TEXT,
    "isSecurityGenerated" BOOLEAN NOT NULL DEFAULT false,
    "securityGeneratedAt" TIMESTAMP(3),
    "generatedByAdminId" TEXT,
    "issuedToName" TEXT,
    "issuedToEmail" TEXT,
    "issuedToPhone" TEXT,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "usedByUserId" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_delivery" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sentByAdminId" TEXT,
    "channel" "DeliveryChannel" NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "gradeOrResult" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_experience" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "designation" TEXT,
    "employmentType" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actionType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alumni_profile_userId_key" ON "alumni_profile"("userId");

-- CreateIndex
CREATE INDEX "alumni_profile_fullName_idx" ON "alumni_profile"("fullName");

-- CreateIndex
CREATE INDEX "alumni_profile_passingYear_idx" ON "alumni_profile"("passingYear");

-- CreateIndex
CREATE INDEX "alumni_profile_batch_idx" ON "alumni_profile"("batch");

-- CreateIndex
CREATE INDEX "alumni_profile_companyName_idx" ON "alumni_profile"("companyName");

-- CreateIndex
CREATE INDEX "alumni_profile_designation_idx" ON "alumni_profile"("designation");

-- CreateIndex
CREATE INDEX "alumni_profile_universityName_idx" ON "alumni_profile"("universityName");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_serialNumber_key" ON "ticket"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_usedByUserId_key" ON "ticket"("usedByUserId");

-- CreateIndex
CREATE INDEX "ticket_status_idx" ON "ticket"("status");

-- CreateIndex
CREATE INDEX "ticket_isUsed_idx" ON "ticket"("isUsed");

-- CreateIndex
CREATE INDEX "ticket_issuedToEmail_idx" ON "ticket"("issuedToEmail");

-- CreateIndex
CREATE INDEX "ticket_issuedToPhone_idx" ON "ticket"("issuedToPhone");

-- CreateIndex
CREATE INDEX "ticket_generatedByAdminId_idx" ON "ticket"("generatedByAdminId");

-- CreateIndex
CREATE INDEX "ticket_delivery_ticketId_idx" ON "ticket_delivery"("ticketId");

-- CreateIndex
CREATE INDEX "ticket_delivery_sentByAdminId_idx" ON "ticket_delivery"("sentByAdminId");

-- CreateIndex
CREATE INDEX "ticket_delivery_channel_idx" ON "ticket_delivery"("channel");

-- CreateIndex
CREATE INDEX "ticket_delivery_deliveryStatus_idx" ON "ticket_delivery"("deliveryStatus");

-- CreateIndex
CREATE INDEX "password_reset_token_userId_idx" ON "password_reset_token"("userId");

-- CreateIndex
CREATE INDEX "password_reset_token_expiresAt_idx" ON "password_reset_token"("expiresAt");

-- CreateIndex
CREATE INDEX "education_history_userId_idx" ON "education_history"("userId");

-- CreateIndex
CREATE INDEX "education_history_sortOrder_idx" ON "education_history"("sortOrder");

-- CreateIndex
CREATE INDEX "work_experience_userId_idx" ON "work_experience"("userId");

-- CreateIndex
CREATE INDEX "work_experience_sortOrder_idx" ON "work_experience"("sortOrder");

-- CreateIndex
CREATE INDEX "work_experience_companyName_idx" ON "work_experience"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "skill_name_key" ON "skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_slug_key" ON "skill"("slug");

-- CreateIndex
CREATE INDEX "user_skill_userId_idx" ON "user_skill"("userId");

-- CreateIndex
CREATE INDEX "user_skill_skillId_idx" ON "user_skill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "user_skill_userId_skillId_key" ON "user_skill"("userId", "skillId");

-- CreateIndex
CREATE INDEX "audit_log_actorUserId_idx" ON "audit_log"("actorUserId");

-- CreateIndex
CREATE INDEX "audit_log_actionType_idx" ON "audit_log"("actionType");

-- CreateIndex
CREATE INDEX "audit_log_entityType_idx" ON "audit_log"("entityType");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- AddForeignKey
ALTER TABLE "alumni_profile" ADD CONSTRAINT "alumni_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_generatedByAdminId_fkey" FOREIGN KEY ("generatedByAdminId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_delivery" ADD CONSTRAINT "ticket_delivery_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_delivery" ADD CONSTRAINT "ticket_delivery_sentByAdminId_fkey" FOREIGN KEY ("sentByAdminId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_history" ADD CONSTRAINT "education_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experience" ADD CONSTRAINT "work_experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skill" ADD CONSTRAINT "user_skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skill" ADD CONSTRAINT "user_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
