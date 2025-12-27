import { IsEmail, IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  password: string;

  @IsNotEmpty({ message: 'Display name is required' })
  @IsString()
  @MinLength(1, { message: 'Display name must be at least 1 character' })
  displayName: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @MinLength(1, { message: 'First name must be at least 1 character' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @MinLength(1, { message: 'Last name must be at least 1 character' })
  lastName: string;

  @IsNotEmpty({ message: 'Country is required' })
  @IsString()
  @MinLength(2, { message: 'Country must be at least 2 characters' })
  country: string;
}
