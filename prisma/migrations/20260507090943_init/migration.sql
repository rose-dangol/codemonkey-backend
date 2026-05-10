/*
  Warnings:

  - You are about to drop the column `name` on the `VariantAttribute` table. All the data in the column will be lost.
  - Added the required column `attributeId` to the `VariantAttribute` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "VariantAttribute_name_idx";

-- AlterTable
ALTER TABLE "VariantAttribute" DROP COLUMN "name",
ADD COLUMN     "attributeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AttributeDefinition" (
    "id" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "allowedValues" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttributeDefinition_serviceTypeId_idx" ON "AttributeDefinition"("serviceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeDefinition_serviceTypeId_key_key" ON "AttributeDefinition"("serviceTypeId", "key");

-- CreateIndex
CREATE INDEX "VariantAttribute_attributeId_idx" ON "VariantAttribute"("attributeId");

-- AddForeignKey
ALTER TABLE "VariantAttribute" ADD CONSTRAINT "VariantAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "AttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeDefinition" ADD CONSTRAINT "AttributeDefinition_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
