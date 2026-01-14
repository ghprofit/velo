import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyAccessDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;
}
