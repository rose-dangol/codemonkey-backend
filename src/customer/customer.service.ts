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

  async getUserGrowth() {
    const customers = await this.prisma.customer.findMany({
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // If no customers
    if (customers.length === 0) {
      return [];
    }

    const monthlyMap = new Map<
      string,
      {
        month: string;
        newUsers: number;
        users: number;
      }
    >();

    // Count new users per month
    customers.forEach((customer) => {
      const date = new Date(customer.createdAt);

      // Unique key
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      // Display label
      const label = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: label,
          newUsers: 0,
          users: 0,
        });
      }

      monthlyMap.get(key)!.newUsers += 1;
    });

    // Generate ALL months from first customer till now
    const firstDate = new Date(customers[0].createdAt);

    const currentDate = new Date();

    const result: {
      month: string;
      newUsers: number;
      users: number;
    }[] = [];

    let runningTotal = 0;

    const iteratorDate = new Date(
      firstDate.getFullYear(),
      firstDate.getMonth(),
      1,
    );

    while (iteratorDate <= currentDate) {
      const key = `${iteratorDate.getFullYear()}-${iteratorDate.getMonth()}`;

      const label = iteratorDate.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });

      const existing = monthlyMap.get(key);

      const newUsers = existing?.newUsers ?? 0;

      runningTotal += newUsers;

      result.push({
        month: label,
        newUsers,
        users: runningTotal,
      });

      // Move to next month
      iteratorDate.setMonth(iteratorDate.getMonth() + 1);
    }

    return result;
  }
  async getUsersByGender() {
    return this.prisma.customer.groupBy({
      by: ['gender'],
      _count: {
        gender: true,
      },
    });
  }

  async getUsersByAgeGroup() {
    return this.prisma.customer.groupBy({
      by: ['ageGroup'],
      _count: {
        ageGroup: true,
      },
    });
  }
}
