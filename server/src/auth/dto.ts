import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class WechatLoginDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1, 2])
  gender?: number;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  signature?: string;
}

export class OrderActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}

export class CreateReviewDto {
  @Type(() => Number)
  @IsInt()
  orderId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ratingLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @Transform(({ value }) => value !== false && value !== 0 && value !== 'false')
  @IsBoolean()
  isAnonymous?: boolean;
}

export class ToggleAnonymousDto {
  @Transform(({ value }) => value === true || value === 1 || value === 'true')
  @IsBoolean()
  isAnonymous!: boolean;
}

export class CreateTravelerDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2, 3, 4])
  idType?: number;

  @IsString()
  @MaxLength(100)
  idNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  phoneAreaCode?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 1 || value === 'true')
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateTravelerDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2, 3, 4])
  idType?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  idNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  phoneAreaCode?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === true || value === 1 || value === 'true';
  })
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateFavoriteDto {
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2, 3, 4, 5])
  targetType!: number;

  @Type(() => Number)
  @IsInt()
  targetId!: number;

  @IsIn(['spot', 'food', 'route', 'guide'])
  tab!: string;

  @IsOptional()
  @IsObject()
  extraInfo?: Record<string, unknown>;
}

export class ReportFootprintDto {
  @Type(() => Number)
  @IsInt()
  poiId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2])
  type?: number;
}

export class CreateFeedbackDto {
  @IsString()
  @MaxLength(80)
  @MinLength(1)
  title!: string;

  @IsString()
  @MaxLength(2000)
  @MinLength(1)
  content!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1, 2, 3])
  type?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contact?: string;
}
