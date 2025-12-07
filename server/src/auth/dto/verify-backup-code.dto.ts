import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyBackupCodeDto {
  @IsNotEmpty()
  @IsString()
  backupCode: string;

  @IsNotEmpty()
  @IsString()
  tempToken: string;
}
