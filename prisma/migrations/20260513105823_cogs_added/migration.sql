-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "cogsData" JSONB;

-- CreateTable
CREATE TABLE "CogsField" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CogsField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CogsField_key_key" ON "CogsField"("key");
