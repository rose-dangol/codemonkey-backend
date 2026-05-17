/*
  Warnings:

  - You are about to drop the column `serviceTypeId` on the `AttributeDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `serviceTypeId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `ServiceType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttributeDefinition" DROP CONSTRAINT "AttributeDefinition_serviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_serviceTypeId_fkey";

-- DropIndex
DROP INDEX "AttributeDefinition_serviceTypeId_idx";

-- DropIndex
DROP INDEX "AttributeDefinition_serviceTypeId_key_key";

-- DropIndex
DROP INDEX "Product_serviceTypeId_idx";

-- AlterTable
ALTER TABLE "AttributeDefinition" DROP COLUMN "serviceTypeId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "serviceTypeId";

-- DropTable
DROP TABLE "ServiceType";
