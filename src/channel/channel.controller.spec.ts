import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

describe('ChannelController', () => {
  let controller: ChannelController;
  let channelService: jest.Mocked<ChannelService>;
  let configService: jest.Mocked<ConfigService>;

  const mockChannelService = {
    getChannels: jest.fn(),
    getChannel: jest.fn(),
    triggerFetchAndStore: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const validApiKey = 'valid-api-key';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [
        {
          provide: ChannelService,
          useValue: mockChannelService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ChannelController>(ChannelController);
    channelService = module.get(ChannelService);
    configService = module.get(ConfigService);

    // Reset mock and set up default valid API key
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue(validApiKey);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getChannels', () => {
    it('should return paginated channels', async () => {
      const query = { page: 1, pageSize: 10 };
      const expectedResult = {
        data: [{ id: '1', name: 'Test Channel' }],
        total: 1,
        page: 1,
        pageSize: 10,
      };

      mockChannelService.getChannels.mockResolvedValue(expectedResult);

      const result = await controller.getChannels(query);

      expect(result).toEqual(expectedResult);
      expect(channelService.getChannels).toHaveBeenCalledWith(query);
    });
  });

  describe('getChannel', () => {
    it('should return a channel by id', async () => {
      const channelId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedChannel = {
        id: channelId,
        name: 'Test Channel',
        videos: [],
      };

      mockChannelService.getChannel.mockResolvedValue(expectedChannel);

      const result = await controller.getChannel(channelId);

      expect(result).toEqual(expectedChannel);
      expect(channelService.getChannel).toHaveBeenCalledWith(channelId);
    });
  });

  describe('triggerFetchAndStore', () => {
    it('should trigger fetch and store process with valid API key', async () => {
      const expectedResult = {
        message: 'Channel videos fetched and stored successfully.',
      };

      mockChannelService.triggerFetchAndStore.mockResolvedValue(expectedResult);

      const result = await controller.triggerFetchAndStore(validApiKey);

      expect(result).toEqual(expectedResult);
      expect(channelService.triggerFetchAndStore).toHaveBeenCalled();
      expect(configService.get).toHaveBeenCalledWith('MANUAL_FETCH_API_KEY');
    });

    it('should throw UnauthorizedException with invalid API key', async () => {
      const invalidApiKey = 'invalid-api-key';
      mockConfigService.get.mockReturnValue(validApiKey);

      try {
        await controller.triggerFetchAndStore(invalidApiKey);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid API key');
      }
      expect(channelService.triggerFetchAndStore).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with missing API key', async () => {
      mockConfigService.get.mockReturnValue(validApiKey);

      try {
        await controller.triggerFetchAndStore(undefined);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid API key');
      }
      expect(channelService.triggerFetchAndStore).not.toHaveBeenCalled();
    });
  });
});
