-- CreateTable
CREATE TABLE "_BrandToProductCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BrandToProductCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BrandToProductCategory_B_index" ON "_BrandToProductCategory"("B");

-- AddForeignKey
ALTER TABLE "_BrandToProductCategory" ADD CONSTRAINT "_BrandToProductCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrandToProductCategory" ADD CONSTRAINT "_BrandToProductCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
