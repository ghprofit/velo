import { IsString, IsNotEmpty } from 'class-validator';

export class CheckAccessEligibilityDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  fingerprint: string;
}
