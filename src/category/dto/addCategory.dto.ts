import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class AddCategoryDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  categoryName: string;

  @IsOptional()
  @IsString()
  categoryParentId: string | null;

  @IsString()
  categoryDesc: string;
}
