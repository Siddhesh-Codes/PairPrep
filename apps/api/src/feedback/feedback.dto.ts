import { IsInt, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt() @Min(1) @Max(5)
  technicalScore: number;

  @IsInt() @Min(1) @Max(5)
  communicationScore: number;

  @IsInt() @Min(1) @Max(5)
  problemSolvingScore: number;

  @IsInt() @Min(1) @Max(5)
  overallRating: number;

  @IsOptional() @IsString() @MaxLength(1000)
  strengths?: string;

  @IsOptional() @IsString() @MaxLength(1000)
  improvements?: string;

  @IsOptional() @IsString() @MaxLength(1000)
  notes?: string;
}
