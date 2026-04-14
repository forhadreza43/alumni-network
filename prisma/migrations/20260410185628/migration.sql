/*
  Warnings:

  - You are about to drop the column `issuedToEmail` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `issuedToPhone` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the `ticket_delivery` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ticket_delivery" DROP CONSTRAINT "ticket_delivery_sentByAdminId_fkey";

-- DropForeignKey
ALTER TABLE "ticket_delivery" DROP CONSTRAINT "ticket_delivery_ticketId_fkey";

-- DropIndex
DROP INDEX "ticket_issuedToEmail_idx";

-- DropIndex
DROP INDEX "ticket_issuedToPhone_idx";

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "issuedToEmail",
DROP COLUMN "issuedToPhone",
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "recipientEmail" TEXT,
ADD COLUMN     "recipientPhone" TEXT;

-- DropTable
DROP TABLE "ticket_delivery";

-- CreateIndex
CREATE INDEX "ticket_recipientEmail_idx" ON "ticket"("recipientEmail");

-- CreateIndex
CREATE INDEX "ticket_recipientPhone_idx" ON "ticket"("recipientPhone");
