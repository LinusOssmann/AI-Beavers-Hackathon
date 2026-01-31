/*
  Warnings:

  - You are about to drop the column `planId` on the `accommodation` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `activity` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `transport` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accommodation" DROP CONSTRAINT "accommodation_planId_fkey";

-- DropForeignKey
ALTER TABLE "activity" DROP CONSTRAINT "activity_planId_fkey";

-- DropForeignKey
ALTER TABLE "transport" DROP CONSTRAINT "transport_planId_fkey";

-- DropIndex
DROP INDEX "accommodation_planId_idx";

-- DropIndex
DROP INDEX "accommodation_planId_isSelected_idx";

-- DropIndex
DROP INDEX "activity_planId_idx";

-- DropIndex
DROP INDEX "activity_planId_isSelected_idx";

-- DropIndex
DROP INDEX "transport_planId_idx";

-- DropIndex
DROP INDEX "transport_planId_isSelected_idx";

-- AlterTable
ALTER TABLE "accommodation" DROP COLUMN "planId";

-- AlterTable
ALTER TABLE "activity" DROP COLUMN "planId";

-- AlterTable
ALTER TABLE "transport" DROP COLUMN "planId";

-- CreateIndex
CREATE INDEX "accommodation_locationId_isSelected_idx" ON "accommodation"("locationId", "isSelected");

-- CreateIndex
CREATE INDEX "activity_locationId_isSelected_idx" ON "activity"("locationId", "isSelected");

-- CreateIndex
CREATE INDEX "transport_locationId_isSelected_idx" ON "transport"("locationId", "isSelected");
