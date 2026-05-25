import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutAddressDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsString()
  @IsOptional()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class CheckoutDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsOptional()
  shippingAddressId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  shippingAddress?: CheckoutAddressDto;
}
