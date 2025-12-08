import { IsEnum, IsOptional } from 'class-validator';

export enum TimePeriod {
  SEVEN_DAYS = '7',
  THIRTY_DAYS = '30',
  NINETY_DAYS = '90',
}

export class GetRevenueQueryDto {
  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod = TimePeriod.THIRTY_DAYS;
}

export class DashboardStatsResponseDto {
  totalCreators: number;
  activeCreators: number;
  inactiveCreators: number;
  totalEarnings: number;
  transactionsToday: number;
}

export class RevenueDataPointDto {
  date: string;
  amount: number;
}

export class RevenueResponseDto {
  data: RevenueDataPointDto[];
  period: string;
}

export class RecentActivityDto {
  id: string;
  creator: string;
  activity: string;
  date: string;
  status: string;
  statusColor: string;
}

export class RecentActivityResponseDto {
  data: RecentActivityDto[];
}
