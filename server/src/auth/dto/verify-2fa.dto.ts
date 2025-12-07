import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Verify2FADto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Token must be 6 digits' })
  token: string;

  @IsNotEmpty()
  @IsString()
  tempToken: string;
}
