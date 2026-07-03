import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateMatchRequestDto {
  @IsString()
  recipientId: string;

  @IsString()
  interviewTypeId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
