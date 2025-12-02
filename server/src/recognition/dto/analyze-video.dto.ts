import {
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentSourceDto } from './analyze-image.dto';

export class NotificationChannelDto {
  @IsString()
  snsTopicArn: string;

  @IsString()
  roleArn: string;
}

export class VideoAnalysisOptionsDto {
  @IsOptional()
  @IsBoolean()
  detectLabels?: boolean = true;

  @IsOptional()
  @IsBoolean()
  detectFaces?: boolean = false;

  @IsOptional()
  @IsBoolean()
  detectText?: boolean = false;

  @IsOptional()
  @IsBoolean()
  detectModerationLabels?: boolean = false;

  @IsOptional()
  @IsBoolean()
  detectCelebrities?: boolean = false;

  @IsOptional()
  @IsBoolean()
  detectPersons?: boolean = false;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationChannelDto)
  notificationChannel?: NotificationChannelDto;
}

export class AnalyzeVideoDto {
  @ValidateNested()
  @Type(() => ContentSourceDto)
  content: ContentSourceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VideoAnalysisOptionsDto)
  options?: VideoAnalysisOptionsDto;
}

export class VideoAnalysisResponseDto {
  success: boolean;
  jobId?: string;
  status?: string;
  data?: any;
  error?: string;
  timestamp: Date;
}

export class GetVideoResultsDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
  nextToken?: string;
}
