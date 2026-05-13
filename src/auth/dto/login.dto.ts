import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  username: string;

  @IsString()
  password: string;
}
