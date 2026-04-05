import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsValidPriceConstraint implements ValidatorConstraintInterface {
    validate(price: number, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare class CreateContentMultipartDto {
    title: string;
    description?: string;
    price: number;
    contentType: string;
    filesMetadata?: string;
}
//# sourceMappingURL=create-content-multipart.dto.d.ts.map