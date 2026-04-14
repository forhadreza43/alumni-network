/*
  Warnings:

  - You are about to drop the column `batch` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `passingYear` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `program` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `universityName` on the `alumni_profile` table. All the data in the column will be lost.
  - You are about to drop the column `degree` on the `education_history` table. All the data in the column will be lost.
  - You are about to drop the column `fieldOfStudy` on the `education_history` table. All the data in the column will be lost.
  - Made the column `startYear` on table `education_history` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `work_experience` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "alumni_profile_batch_idx";

-- DropIndex
DROP INDEX "alumni_profile_companyName_idx";

-- DropIndex
DROP INDEX "alumni_profile_designation_idx";

-- DropIndex
DROP INDEX "alumni_profile_passingYear_idx";

-- DropIndex
DROP INDEX "alumni_profile_universityName_idx";

-- AlterTable
ALTER TABLE "alumni_profile" DROP COLUMN "batch",
DROP COLUMN "companyName",
DROP COLUMN "department",
DROP COLUMN "designation",
DROP COLUMN "passingYear",
DROP COLUMN "program",
DROP COLUMN "studentId",
DROP COLUMN "universityName";

-- AlterTable
ALTER TABLE "education_history" DROP COLUMN "degree",
DROP COLUMN "fieldOfStudy",
ADD COLUMN     "batch" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "program" TEXT,
ADD COLUMN     "studentId" TEXT,
ALTER COLUMN "startYear" SET NOT NULL;

-- AlterTable
ALTER TABLE "work_experience" ALTER COLUMN "startDate" SET NOT NULL;
