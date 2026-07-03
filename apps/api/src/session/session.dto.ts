import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  partnerId: string;

  @IsString()
  interviewTypeId: string;

  @IsOptional()
  @IsString()
  matchRequestId?: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelSessionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
