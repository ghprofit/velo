import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Verify2FADto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Token must be exactly 6 digits' })
  token: string;
}

export class Verify2FAResponseDto {
  verified: boolean;
  message: string;
}
