import { IsArray, IsOptional, IsString } from 'class-validator';

export class AddBrandDto {
  @IsString()
  brandName: string;

  @IsString()
  brandDesc: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productId: string[] | undefined;
}
