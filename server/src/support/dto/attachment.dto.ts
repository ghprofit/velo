import { IsString, IsNumber, IsNotEmpty, Max, Min } from 'class-validator';

export class AttachmentDto {
  @IsString()
  @IsNotEmpty()
  fileData: string; // Base64

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsNumber()
  @Min(1)
  @Max(5 * 1024 * 1024) // 5MB
  fileSize: number;
}
