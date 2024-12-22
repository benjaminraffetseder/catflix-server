import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelService } from './channel.service';
import { GetChannelsDto } from './dto/get-channels.dto';

@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getChannels(@Query() query: GetChannelsDto) {
    return this.channelService.getChannels(query);
  }

  @Get(':id')
  getChannel(@Param('id') id: string) {
    return this.channelService.getChannel(id);
  }

  @Get('fetch/trigger')
  triggerFetchAndStore(@Headers('x-api-key') apiKey: string) {
    if (apiKey !== this.configService.get('MANUAL_FETCH_API_KEY')) {
      throw new UnauthorizedException('Invalid API key');
    }
    return this.channelService.triggerFetchAndStore();
  }
}
