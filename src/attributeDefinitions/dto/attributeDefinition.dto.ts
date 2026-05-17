import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AttributeDefinitionDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  key: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['text', 'enum', 'number'])
  type: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedValues?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
