import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UnauthorizedException,
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

  @Get('fetch')
  async triggerFetchAndStore(@Headers('x-api-key') apiKey: string) {
    if (apiKey !== this.configService.get('MANUAL_FETCH_API_KEY')) {
      throw new UnauthorizedException('Invalid API key');
    }
    return this.videoService.triggerFetchAndStore();
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
