import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ServiceTypeService } from "./service.service";
import { ServiceTypeDto } from "./dto/serviceType.dto";

@Controller('serviceType')
export class ServiceTypeController{

    constructor(private readonly serviceTypeService: ServiceTypeService) {}

    @Post('addserviceType')
    async addServiceType(@Body() serviceType: ServiceTypeDto) {
        return this.serviceTypeService.addServiceType(serviceType);
    }

    @Get('getallserviceType')
    async getAllServiceType() {
        return this.serviceTypeService.getAllServiceType();
    }

    @Get('getserviceTypeById/:id')
    async getServiceTypeById(@Param('id') id: string) {
        return this.serviceTypeService.getServiceTypeById(id);
    }
}