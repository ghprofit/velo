import { IsNotEmpty, IsString, IsOptional, IsObject, IsUrl } from 'class-validator';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsObject()
  verification: {
    callback?: string;
    person: {
      firstName?: string;
      lastName?: string;
      idNumber?: string;
      dateOfBirth?: string;
    };
    document?: {
      number?: string;
      type?: string;
      country?: string;
    };
    vendorData?: string;
    url?: string; // Success redirect URL
  };

  @IsOptional()
  @IsString()
  timestamp?: string;
}
