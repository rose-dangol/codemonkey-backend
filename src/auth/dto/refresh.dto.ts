import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  username: string;

  @IsString()
  refreshToken: string;
}
