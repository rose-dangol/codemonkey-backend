import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async createCustomer(data: CustomerDto) {
    return this.prisma.customer.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        passwordHash: 'GUEST_USER',
        isGuest: true,
      },
    });
  }

  async getAllCustomers() {
    return this.prisma.customer.findMany();
  }

  async getCustomerById(id: string) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  async updateCustomer(id: string, data: CustomerDto) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  async deleteCustomer(id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }
}
