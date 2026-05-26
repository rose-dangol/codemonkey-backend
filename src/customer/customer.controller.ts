import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerDto } from './dto/customer.dto';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('/addCustomer')
  async addCustomer(@Body() dto: CustomerDto) {
    return this.customerService.createCustomer(dto);
  }

  @Get('/getAllCustomers')
  async getAllCustomers() {
    return this.customerService.getAllCustomers();
  }

  @Get('/getCustomerById/:id')
  async getCustomerById(@Param('id') id: string) {
    return this.customerService.getCustomerById(id);
  }

  @Put('/updateCustomer/:id')
  async updateCustomer(@Param('id') id: string, @Body() payload: CustomerDto) {
    return this.customerService.updateCustomer(id, payload);
  }

  //   @Delete('/deleteCustomer')
  //   async deleteCustomer(@Body() body: { ids: string[] }) {
  //     return this.customerService.deleteCustomer(body.ids);
  //   }

  @Get('/user-growth')
  async getUserGrowth() {
    return this.customerService.getUserGrowth();
  }
}
