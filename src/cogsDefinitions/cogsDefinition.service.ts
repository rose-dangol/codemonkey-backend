import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CogsDefinitionDto } from './dto/cogsDefinition.dto';

@Injectable()
export class CogsDefinitionService {
  constructor(private prisma: PrismaService) {}

  async addCogsField(dto: CogsDefinitionDto) {
    return this.prisma.cogsField.create({ data: dto });
  }

  async getAllCogsFields() {
    return this.prisma.cogsField.findMany();
  }

  async getCogsFieldById(id: string) {
    const cogs = await this.prisma.cogsField.findUnique({ where: { id } });
    if (!cogs) {
      throw new NotFoundException('No Cogs Field Found');
    }
    return cogs;
  }

  async updateCogsField(id: string, payload: CogsDefinitionDto) {
    const cogs = await this.prisma.cogsField.findUnique({ where: { id } });
    if (!cogs) {
      throw new NotFoundException('No Cogs Field Found');
    }
    return this.prisma.cogsField.update({
      where: { id },
      data: {
        name: payload.name,
        key: payload.key,
        isActive: payload.isActive ?? false,
      },
    });
  }

  async deleteCogsField(ids: string[]) {
    return this.prisma.cogsField.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
