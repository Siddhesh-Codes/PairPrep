import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsEnum(['junior', 'mid', 'senior'])
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  leetcode?: string;

  @IsOptional()
  @IsBoolean()
  isLinkedinPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isGithubPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isLeetcodePublic?: boolean;
}

export class UpdateInterestsDto {
  @IsArray()
  @IsString({ each: true })
  interviewTypeIds: string[];
}

export class UpdateAvailabilityDto {
  @IsArray()
  slots: { day: string; slot: string }[];
}
