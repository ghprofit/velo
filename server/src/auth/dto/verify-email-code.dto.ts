import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyEmailCodeDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Verification code must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'Verification code must be 6 digits' })
  code: string;
}
