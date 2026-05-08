import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { AttributeDefinitionController } from "./attributeDefinition.controller";
import { AttributeDefinitionService } from "./attributeDefinition.service";




@Module({
  imports:[PrismaModule],
  controllers:[AttributeDefinitionController],
  providers:[AttributeDefinitionService]
})

export class AttributeDefinitionModule {}