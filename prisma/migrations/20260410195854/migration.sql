/*
  Warnings:

  - You are about to drop the column `isProfilePublic` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the `password_reset_token` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "password_reset_token" DROP CONSTRAINT "password_reset_token_userId_fkey";

-- AlterTable
ALTER TABLE "alumni_profile" DROP COLUMN "isProfilePublic";

-- DropTable
DROP TABLE "password_reset_token";
