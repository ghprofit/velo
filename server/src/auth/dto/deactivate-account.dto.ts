import { IsString, IsNotEmpty } from 'class-validator';

export class DeactivateAccountDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
