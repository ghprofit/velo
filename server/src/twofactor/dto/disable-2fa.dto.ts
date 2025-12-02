import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Disable2FADto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Token must be exactly 6 digits' })
  token: string;
}

export class Disable2FAResponseDto {
  disabled: boolean;
  message: string;
}
