-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('AGE_10_15', 'AGE_15_18', 'AGE_19_25', 'AGE_26_35', 'AGE_36_45', 'AGE_46_PLUS');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "ageGroup" "AgeGroup",
ADD COLUMN     "gender" "Gender";

-- CreateIndex
CREATE INDEX "Customer_ageGroup_idx" ON "Customer"("ageGroup");

-- CreateIndex
CREATE INDEX "Customer_gender_idx" ON "Customer"("gender");
