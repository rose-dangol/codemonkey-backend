import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async createCustomer(data: CustomerDto) {
    const { address, ...customerData } = data;
    return this.prisma.customer.create({
      data: {
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        passwordHash: 'GUEST_USER',
        isGuest: true,
        addresses: address
          ? {
              create: {
                label: 'Home',
                recipientName:
                  `${customerData.firstName ?? ''} ${customerData.lastName ?? ''}`.trim() ||
                  'Recipient',
                phone: customerData.phone,
                line1: address.line1,
                line2: address.line2,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country ?? 'ID',
                isDefault: true,
              },
            }
          : undefined,
      },
      include: {
        addresses: true,
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
