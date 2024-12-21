import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CategoryResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsNumber()
  videoCount: number;
}

class VideoInCategoryDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsDate()
  uploadDate: Date;

  @IsNumber()
  length: number;

  @IsString()
  youtubeId: string;
}

export class CategoryWithVideosResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @ValidateNested({ each: true })
  @Type(() => VideoInCategoryDto)
  videos: VideoInCategoryDto[];
}

export class CategoryVideoCountDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsNumber()
  videoCount: number;
}
