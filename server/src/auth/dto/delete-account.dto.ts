import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  confirmation: string; // Must type "DELETE MY ACCOUNT"
}
