import { IsEmail, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class JoinWaitlistDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsInt()
  @Min(13)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  heardFrom?: string;
}
