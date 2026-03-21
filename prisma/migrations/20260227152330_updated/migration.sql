/*
  Warnings:

  - You are about to drop the `_BrandToProductCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BrandToProductCategory" DROP CONSTRAINT "_BrandToProductCategory_A_fkey";

-- DropForeignKey
ALTER TABLE "_BrandToProductCategory" DROP CONSTRAINT "_BrandToProductCategory_B_fkey";

-- DropTable
DROP TABLE "_BrandToProductCategory";
