import { IsNotEmpty, IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class WebhookEventDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  feature: string;

  @IsNotEmpty()
  @IsNumber()
  code: number;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsObject()
  vendorData?: any;
}

export class WebhookDecisionDto {
  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsObject()
  verification: {
    id: string;
    code: number;
    status: string;
    reason?: string;
    reasonCode?: number;
    person?: any;
    document?: any;
    decisionTime?: string;
    acceptanceTime?: string;
    vendorData?: string;
  };
}
