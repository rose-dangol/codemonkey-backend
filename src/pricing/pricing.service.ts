import { Injectable } from '@nestjs/common';

@Injectable()
export class PricingService {
  calculate(cart: any) {
    const subtotal = this.calculateSubtotal(cart);

    const shippingFee = this.calculateShipping(cart);

    const discountTotal = this.calculateDiscount(cart);

    const taxTotal = this.calculateTax(subtotal, shippingFee, discountTotal);

    const grandTotal = subtotal + shippingFee + taxTotal - discountTotal;

    return {
      subtotal,
      shippingFee,
      discountTotal,
      taxTotal,
      grandTotal,
    };
  }

  calculateSubtotal(cart: any): number {
    let subtotal = 0;

    for (const item of cart.items) {
      subtotal += Number(item.priceSnapshot) * item.quantity;
    }

    return subtotal;
  }

  calculateShipping(cart: any): number {
    return 0;
  }

  calculateDiscount(cart: any): number {
    return 0;
  }

  calculateTax(
    subtotal: number,
    shippingFee: number,
    discountTotal: number,
  ): number {
    return 0;
  }

  calculateProfit(cart: any): number {
    let profit = 0;
    for (const item of cart.items) {
      const cogs = Number(item.variant?.cogsData?.cost ?? 0);
      const sellingPrice = Number(item.priceSnapshot);
      profit += (sellingPrice - cogs) * item.quantity;
    }
    return profit;
  }

  calculateMargin(sales: number, profit: number): number {
    if (sales === 0) return 0;

    return (profit / sales) * 100;
  }
}
