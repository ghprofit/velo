import { IsNotEmpty, IsString, Length } from 'class-validator';

export class Enable2FADto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  secret: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Token must be exactly 6 digits' })
  token: string;
}

export class Enable2FAResponseDto {
  enabled: boolean;
  message: string;
  backupCodes?: string[];
}
