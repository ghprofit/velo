import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyDeviceCodeDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  fingerprint: string;

  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
