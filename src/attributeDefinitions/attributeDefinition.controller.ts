import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AttributeDefinitionService } from './attributeDefinition.service';
import { AttributeDefinitionDto } from './dto/attributeDefinition.dto';

@Controller('attribute')
export class AttributeDefinitionController {
  constructor(
    private readonly attributeDefinitionService: AttributeDefinitionService,
  ) {}

  @Post('addAttribute')
  async addAttributeDefinition(
    @Body() attributeDefinitionPayload: AttributeDefinitionDto,
  ) {
    return this.attributeDefinitionService.addAttributeDefinition(
      attributeDefinitionPayload,
    );
  }
  @Get('getAllAttribute')
  async getAllAttributeDefinition() {
    return this.attributeDefinitionService.getAllAttributeDefinition();
  }

  @Get('getAttributeById/:id')
  async getAttributeDefinitionById(@Param('id') id: string) {
    return this.attributeDefinitionService.getAttributeDefinitionById(id);
  }

  @Put('updateAttribute/:id')
  async updateAttributeDefinition(
    @Param('id') id: string,
    @Body() attributeDefinitionPayload: AttributeDefinitionDto,
  ) {
    return this.attributeDefinitionService.updateAttributeDefinition(
      id,
      attributeDefinitionPayload,
    );
  }

  @Delete('deleteAttribute/:id')
  async deleteAttributeDefinition(@Param('id') id: string) {
    return this.attributeDefinitionService.deleteAttributeDefinition(id);
  }
}
