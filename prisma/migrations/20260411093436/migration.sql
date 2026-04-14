/*
  Warnings:

  - The values [SECURITY_GENERATED] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fullName` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `profilePhotoUrl` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('AVAILABLE', 'SENT', 'USED', 'BLOCKED', 'EXPIRED');
ALTER TABLE "public"."ticket" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ticket" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "ticket" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- DropIndex
DROP INDEX "alumni_profile_fullName_idx";

-- DropIndex
DROP INDEX "user_status_idx";

-- AlterTable
ALTER TABLE "alumni_profile" DROP COLUMN "fullName",
DROP COLUMN "profilePhotoUrl";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "phone";
