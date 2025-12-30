import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class RequestDeviceVerificationDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  fingerprint: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
