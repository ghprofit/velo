import { IsNotEmpty, IsString } from 'class-validator';

export class Setup2FADto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class Setup2FAResponseDto {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
  userId: string;
}
