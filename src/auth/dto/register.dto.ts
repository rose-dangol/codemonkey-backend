import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  username: string;

  @IsString()
  passwordHash: string;
}
