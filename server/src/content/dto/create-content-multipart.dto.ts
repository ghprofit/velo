import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom validator to ensure price has at most 2 decimal places
 */
@ValidatorConstraint({ name: 'isValidPrice', async: false })
export class IsValidPriceConstraint implements ValidatorConstraintInterface {
  validate(price: number, args: ValidationArguments) {
    if (!Number.isFinite(price)) {
      return false;
    }
    // Check if price has at most 2 decimal places
    const priceString = price.toString();
    const decimalIndex = priceString.indexOf('.');
    if (decimalIndex === -1) {
      return true; // No decimal point, valid (e.g., 10)
    }
    const decimalPlaces = priceString.length - decimalIndex - 1;
    return decimalPlaces <= 2;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Price must have at most 2 decimal places (e.g., 9.99, not 9.999)';
  }
}

/**
 * DTO for creating content via multipart/form-data upload
 * Files are uploaded using multer, not base64 strings
 */
export class CreateContentMultipartDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @Max(10000)
  @Validate(IsValidPriceConstraint)
  price: number;

  @IsString()
  contentType: string; // 'IMAGE', 'VIDEO', 'GALLERY'

  // Metadata for uploaded files (sent as JSON string)
  @IsString()
  @IsOptional()
  filesMetadata?: string; // JSON string of { fileName, contentType, fileSize, duration? }[]
}
