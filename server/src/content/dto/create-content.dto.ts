import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  ValidateNested,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Custom validator to ensure price has at most 2 decimal places (Bug #7)
 */
@ValidatorConstraint({ name: 'isValidPrice', async: false })
class IsValidPriceConstraint implements ValidatorConstraintInterface {
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

export class ContentItemDto {
  @IsString()
  fileData: string; // Base64 encoded file

  @IsString()
  fileName: string;

  @IsString()
  contentType: string; // image/jpeg, image/png, video/mp4, etc.

  @IsNumber()
  fileSize: number;

  @IsNumber()
  @IsOptional()
  duration?: number; // For videos
}

export class CreateContentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @Max(10000)
  @Validate(IsValidPriceConstraint) // Bug #7: Ensure at most 2 decimal places
  price: number;

  @IsString()
  contentType: string; // 'IMAGE', 'VIDEO', 'GALLERY'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemDto)
  items: ContentItemDto[];

  @IsString()
  thumbnailData: string; // Base64 encoded thumbnail
}
