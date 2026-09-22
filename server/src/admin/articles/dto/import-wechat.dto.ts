import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class ImportWechatDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: '请输入有效的文章链接' })
  url!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  articleId?: number;

  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;
}
