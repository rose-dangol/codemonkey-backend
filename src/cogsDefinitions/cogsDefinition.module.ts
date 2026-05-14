import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CogsDefinitionController } from './cogsDefinition.controller';
import { CogsDefinitionService } from './cogsDefinition.service';

@Module({
  imports: [PrismaModule],
  providers: [CogsDefinitionService],
  controllers: [CogsDefinitionController],
})
export class CogsDefinitionModule {}
