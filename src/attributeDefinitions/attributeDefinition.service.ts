import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttributeDefinitionDto } from './dto/attributeDefinition.dto';

@Injectable()
export class AttributeDefinitionService {
  constructor(private prisma: PrismaService) {}

  async addAttributeDefinition(
    attributeDefinitionPayload: AttributeDefinitionDto,
  ) {
    return await this.prisma.attributeDefinition.create({
      data: {
        key: attributeDefinitionPayload.key,
        name: attributeDefinitionPayload.name,
        type: attributeDefinitionPayload.type,
        allowedValues: attributeDefinitionPayload.allowedValues,
        isActive: attributeDefinitionPayload.isActive,
      },
    });
  }

  async getAllAttributeDefinition() {
    const attribute = await this.prisma.attributeDefinition.findMany();
    if (attribute.length === 0) {
      throw new NotFoundException('Attribute not found');
    }
    return attribute;
  }

  // async getAttributeDefinitionByService(serviceTypeId: string){
  //     const attribute = await this.prisma.attributeDefinition.findMany({
  //         where: {
  //             serviceTypeId: serviceTypeId,
  //         },
  //     });
  //     if(attribute.length === 0){
  //         throw new NotFoundException("Attribute not found");
  //     }
  //     return attribute;
  // }

  async getAttributeDefinitionById(id: string) {
    const attribute = await this.prisma.attributeDefinition.findUnique({
      where: {
        id: id,
      },
    });
    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }
    return attribute;
  }

  async updateAttributeDefinition(
    id: string,
    attributeDefinitionPayload: AttributeDefinitionDto,
  ) {
    const attribute = await this.prisma.attributeDefinition.findUnique({
      where: {
        id: id,
      },
    });
    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }
    return this.prisma.attributeDefinition.update({
      where: {
        id: id,
      },
      data: attributeDefinitionPayload,
    });
  }

  async deleteAttributeDefinition(id: string) {
    const attribute = await this.prisma.attributeDefinition.findUnique({
      where: {
        id: id,
      },
    });
    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }
    return this.prisma.attributeDefinition.delete({
      where: {
        id: id,
      },
    });
  }
}
