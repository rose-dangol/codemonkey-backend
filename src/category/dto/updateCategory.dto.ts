import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  categoryName: string;

  @IsOptional()
  @IsString()
  categoryParentId: string | null;

  @IsOptional()
  @IsString()
  categoryImage: string;

  @IsOptional()
  @IsString()
  categoryDesc: string;
}
