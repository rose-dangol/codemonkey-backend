import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCategoryDto } from './dto/addCategory.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async addCategory(
    categoryDetail: AddCategoryDto,
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Category image is required');
    }

    const uploaded = await this.cloudinary.uploadFile(file);

    if (!('url' in uploaded)) {
      throw new Error('Failed to upload image.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const imageUrl = uploaded.url;

    return this.prisma.productCategory.create({
      data: {
        ...categoryDetail,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        categoryImage: imageUrl,
      },
    });
  }

  //getCategory(P1)

  async getCategory(rootId: string | null = null) {
    const allCategories = await this.prisma.productCategory.findMany(); //all p1,c1,c2,sc1
    if (!rootId) {
      return buildTree(allCategories, null);
    }
    const rootCategory = allCategories.find((c) => c.id === rootId);
    if (!rootCategory) return null;
    return {
      ...rootCategory,
      subCategories: buildTree(allCategories, rootId),
    };
    function buildTree(categories: any[], parentId: string | null = null) {
      return categories
        .filter((c) => c.categoryParentId === parentId)
        .map((c) => ({
          ...c,
          subCategories: buildTree(categories, c.id),
        }));
    }
  }

  async getCategoryByID(categoryId: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id: categoryId },
    });
    const allcategory = await this.prisma.productCategory.findMany({
      include: {
        products: {
          include: {
            brand: {
              select: {
                brandName: true,
              },
            },
          },
        },
      },
    });
    const mappedLookUpTable = allcategory.reduce((acc, data) => {
      const key = data?.categoryParentId ?? 'null';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        categoryName: data?.categoryName,
        id: data?.id,
        products: data?.products,
      });
      return acc;
    }, {});
    const categoryTree = (
      categories: Record<string, any[]>,
      parentID: string | null = null,
    ): any[] => {
      const children = categories[parentID ?? 'null'] || [];
      return children.map((c) => ({
        ...c,
        ...(categoryTree(mappedLookUpTable, c.id).length > 0
          ? { subCategories: categoryTree(mappedLookUpTable, c.id) }
          : {}),
      }));
    };
    return {
      ...category,
      subCategories: categoryTree(mappedLookUpTable, category?.id),
    };
  }

  async deleteCategory(categoryId: string[]) {
    if (!categoryId || categoryId.length === 0) {
      throw new NotFoundException('No Category Selected');
    }

    const categories = await this.prisma.productCategory.findMany({
      where: {
        id: { in: categoryId },
      },
      select: {
        id: true,
        categoryImage: true,
      },
    });

    if (!categories.length) {
      throw new NotFoundException('Categories not found');
    }

    const categoriesWithProducts = await this.prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId,
        },
      },
      select: {
        categoryId: true,
      },
    });

    if (categoriesWithProducts.length > 0) {
      throw new BadRequestException(
        'Cannot delete, some categories contain products',
      );
    }

    await Promise.all(
      categories.map(async (cat) => {
        if (cat.categoryImage) {
          const publicId = this.cloudinary.getPublicIdFromUrl(
            cat.categoryImage,
          );
          if (publicId) {
            await this.cloudinary.deleteFile(publicId);
          }
        }
      }),
    );

    return await this.prisma.productCategory.deleteMany({
      where: {
        id: {
          in: categoryId,
        },
      },
    });
  }

  async isDescendant(categoryId: string, potentialParentId: string) {
    let currentId: string | null = potentialParentId;

    while (currentId) {
      if (currentId === categoryId) {
        return true;
      }
      const category = await this.prisma.productCategory.findUnique({
        where: { id: currentId },
        select: { categoryParentId: true },
      });
      currentId = category?.categoryParentId || null;
    }

    return false;
  }

  async updateCategory(
    categoryDetail: AddCategoryDto,
    categoryId: string,
    file?: Express.Multer.File,
  ) {
    const existingCategory = await this.prisma.productCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    let imageUrl = existingCategory.categoryImage;

    if (file) {
      const uploaded = await this.cloudinary.uploadFile(file);
      if (uploaded && 'url' in uploaded) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        imageUrl = uploaded.url;

        // delete old image from Cloudinary if it exists
        if (existingCategory.categoryImage) {
          const publicId = this.cloudinary.getPublicIdFromUrl(
            existingCategory.categoryImage,
          );
          if (publicId) {
            try {
              await this.cloudinary.deleteFile(publicId);
            } catch (error) {
              console.error(
                `Failed to delete old image ${publicId} from Cloudinary:`,
                error,
              );
            }
          }
        }
      } else {
        throw new Error('Failed to upload image.');
      }
    } else if (existingCategory.categoryImage !== undefined) {
      const oldImageUrl = existingCategory.categoryImage;
      imageUrl = existingCategory.categoryImage;

      // If the old image URL has changed/cleared, delete it from Cloudinary
      if (oldImageUrl && oldImageUrl !== imageUrl) {
        const publicId = this.cloudinary.getPublicIdFromUrl(oldImageUrl);
        if (publicId) {
          try {
            await this.cloudinary.deleteFile(publicId);
          } catch (error) {
            console.error(
              `Failed to delete old image ${publicId} from Cloudinary:`,
              error,
            );
          }
        }
      }
    }

    if (categoryDetail.categoryParentId === categoryId) {
      throw new BadRequestException('Category cannot be its own parent');
    }
    if (
      categoryDetail.categoryParentId &&
      (await this.isDescendant(categoryId, categoryDetail.categoryParentId))
    ) {
      throw new BadRequestException(
        'Category cannot be assigned to its own child',
      );
    }
    return this.prisma.productCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        categoryName: categoryDetail.categoryName,
        categoryImage: imageUrl,
        categoryDesc: categoryDetail.categoryDesc,
        categoryParentId: categoryDetail.categoryParentId,
      },
    });
  }
}
