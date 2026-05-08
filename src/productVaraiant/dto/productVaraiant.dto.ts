import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class VariantAttributeItemDto {
  @IsUUID()
  attributeId: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductVariantDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "Price can have at most 2 decimal places" }
  )
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeItemDto)
  attributes: VariantAttributeItemDto[];
}