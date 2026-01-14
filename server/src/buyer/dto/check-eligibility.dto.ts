import { IsNotEmpty, IsString } from 'class-validator';

export class CheckEligibilityDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  fingerprint: string;
}
