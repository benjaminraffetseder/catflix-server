import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetVideosDto } from './dto/get-videos.dto';
import { VideoService } from './video.service';

@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getVideos(@Query() query: GetVideosDto) {
    return this.videoService.getVideos(query);
  }

  @Get('categories')
  async getCategories() {
    return this.videoService.getCategories();
  }

  @Get(':id')
  async getVideo(@Param('id', ParseUUIDPipe) id: string) {
    const video = await this.videoService.getVideo(id);
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }
}
