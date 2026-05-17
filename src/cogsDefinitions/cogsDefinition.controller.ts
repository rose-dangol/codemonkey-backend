import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CogsDefinitionService } from './cogsDefinition.service';
import { CogsDefinitionDto } from './dto/cogsDefinition.dto';

@Controller('cogs')
export class CogsDefinitionController {
  constructor(private readonly cogsDefinitionService: CogsDefinitionService) {}

  @Post('/addCogsField')
  async addCogsField(@Body() dto: CogsDefinitionDto) {
    return this.cogsDefinitionService.addCogsField(dto);
  }

  @Get('/getAllCogsFields')
  async getAllCogsFields() {
    return this.cogsDefinitionService.getAllCogsFields();
  }

  @Get('/getCogsFieldById/:id')
  async getCogsFieldById(@Param('id') id: string) {
    return this.cogsDefinitionService.getCogsFieldById(id);
  }

  @Put('/updateCogsField/:id')
  async updateCogsField(
    @Param('id') id: string,
    @Body() payload: CogsDefinitionDto,
  ) {
    return this.cogsDefinitionService.updateCogsField(id, payload);
  }

  @Delete('/deleteCogsField')
  async deleteCogsField(@Body() body: { ids: string[] }) {
    return this.cogsDefinitionService.deleteCogsField(body.ids);
  }
}
