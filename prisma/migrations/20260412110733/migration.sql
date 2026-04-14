/*
  Warnings:

  - You are about to drop the `user_skill` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,name]` on the table `skill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `skill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_skill" DROP CONSTRAINT "user_skill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "user_skill" DROP CONSTRAINT "user_skill_userId_fkey";

-- DropIndex
DROP INDEX "skill_name_key";

-- DropIndex
DROP INDEX "skill_slug_key";

-- AlterTable
ALTER TABLE "skill" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "slug" DROP NOT NULL;

-- DropTable
DROP TABLE "user_skill";

-- CreateIndex
CREATE INDEX "skill_userId_idx" ON "skill"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skill_userId_name_key" ON "skill"("userId", "name");

-- AddForeignKey
ALTER TABLE "skill" ADD CONSTRAINT "skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
