/*
  Warnings:

  - You are about to drop the column `isSecurityGenerated` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `issuedToName` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `securityGeneratedAt` on the `ticket` table. All the data in the column will be lost.
  - You are about to drop the column `serialNumber` on the `ticket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticketNumber]` on the table `ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ticketNumber` to the `ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ticket_serialNumber_key";

-- AlterTable
ALTER TABLE "ticket" DROP COLUMN "isSecurityGenerated",
DROP COLUMN "issuedToName",
DROP COLUMN "securityGeneratedAt",
DROP COLUMN "serialNumber",
ADD COLUMN     "ticketNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ticket_ticketNumber_key" ON "ticket"("ticketNumber");
