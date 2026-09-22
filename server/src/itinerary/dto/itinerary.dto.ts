import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ApplyItemDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsNumber() timeSlot?: number;
  @IsOptional() @IsString() exactStartTime?: string;
  @IsOptional() @IsString() exactEndTime?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsNumber() poiId?: number;
  @IsOptional() details?: Record<string, unknown>;
}

export class ApplyDayDto {
  @IsOptional() @IsNumber() dayNumber?: number;
  @IsOptional() @IsString() date?: string;
  @IsOptional() weather?: unknown;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyItemDto)
  items: ApplyItemDto[];
}

export class ApplyPlanDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() attractionSummary?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() cities?: unknown;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyDayDto)
  days: ApplyDayDto[];
}

export class SwitchPlanDto {
  @IsOptional() @IsBoolean() confirm?: boolean;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
}

export class RestoreSnapshotDto {
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
}

export class SenseDto {
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
  @IsOptional() @IsString() at?: string;
}

export class CompleteItemDto {
  @IsOptional() @IsBoolean() completed?: boolean;
}

export class CreateConversationDto {
  @IsOptional() @IsNumber() planId?: number;
  @IsOptional() @IsString() userInput?: string;
  @IsOptional() formData?: unknown;
  @IsOptional() aiResponse?: unknown;
}

export class IgnoreHintDto {
  @IsString() hintKey: string;
}

export const PLAN_STATUSES = ['current', 'draft', 'archived'] as const;

export class ListPlansQueryDto {
  @IsOptional()
  @IsIn(PLAN_STATUSES)
  status?: (typeof PLAN_STATUSES)[number];
}
