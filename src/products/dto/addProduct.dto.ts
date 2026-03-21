import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddProductDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  productName: string;

  @IsString()
  @IsOptional()
  productImage: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null ? 1 : Number(value),
  )
  @IsNumber()
  quantity: number = 1;

  @IsOptional()
  @IsString()
  parentId?: string | undefined;

  @IsOptional()
  @IsString()
  productCategoryId?: string | undefined;
}
