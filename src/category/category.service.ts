import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCategoryDto } from './dto/addCategory.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}
  async addCategory(categoryDetail: AddCategoryDto) {
    return this.prisma.productCategory.create({
      data: categoryDetail,
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

  async updateCategory(categoryDetail: AddCategoryDto, categoryId: string) {
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
        categoryImage: categoryDetail.categoryImage,
        categoryDesc: categoryDetail.categoryDesc,
        categoryParentId: categoryDetail.categoryParentId,
      },
    });
  }
}
