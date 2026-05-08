import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ServiceTypeController } from "./service.controller";
import { ServiceTypeService } from "./service.service";



@Module({
  imports:[PrismaModule],
  controllers:[ServiceTypeController],
  providers:[ServiceTypeService]
})

export class ServiceTypeModule {}