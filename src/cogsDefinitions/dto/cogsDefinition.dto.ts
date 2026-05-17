import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CogsDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
