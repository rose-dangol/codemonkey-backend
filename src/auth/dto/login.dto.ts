import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @Transform(({ value }) =>
      typeof value === 'string' ? value.trim().toLowerCase() : value,
    )
  username: string;

  @IsString()
  @MinLength(2)
  passwordHash: string;
}
