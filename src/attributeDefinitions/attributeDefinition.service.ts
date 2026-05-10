import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AttributeDefinitionDto } from "./dto/attributeDefinition.dto";

@Injectable()
export class AttributeDefinitionService{
    constructor(private prisma: PrismaService) { }

    async addAttributeDefinition(attributeDefinitionPayload: AttributeDefinitionDto){
        const attribute = this.prisma.attributeDefinition.findUnique({
            where: {
                serviceTypeId_key: {
                    serviceTypeId: attributeDefinitionPayload.serviceTypeId,
                    key: attributeDefinitionPayload.key,
                }
            }
        });
        if(await attribute){
            throw new ConflictException("Attribute already exists");
        }
        return this.prisma.attributeDefinition.create({
            data: attributeDefinitionPayload,
        });

    }

    async getAttributeDefinitionByService(serviceTypeId: string){
        const attribute = await this.prisma.attributeDefinition.findMany({
            where: {
                serviceTypeId: serviceTypeId,
            },
        });
        if(attribute.length === 0){
            throw new NotFoundException("Attribute not found");
        }
        return attribute;
    }

    async getAttributeDefinitionById(id: string){
        const attribute = await this.prisma.attributeDefinition.findUnique({
            where: {
                id: id,
            },
        });
        if(!attribute){
            throw new NotFoundException("Attribute not found");
        }
        return attribute;
    }

    async updateAttributeDefinition(id: string, attributeDefinitionPayload: AttributeDefinitionDto){
        const attribute = await this.prisma.attributeDefinition.findUnique({
            where: {
                id: id,
            },
        });
        if(!attribute){
            throw new NotFoundException("Attribute not found");
        }
        return this.prisma.attributeDefinition.update({
            where: {
                id: id,
            },
            data: attributeDefinitionPayload,
        });
    }

    async deleteAttributeDefinition(id: string){
        const attribute = await this.prisma.attributeDefinition.findUnique({
            where: {
                id: id,
            },
        });
        if(!attribute){
            throw new NotFoundException("Attribute not found");
        }
        return this.prisma.attributeDefinition.delete({
            where: {
                id: id,
            },
        });
    }


}
