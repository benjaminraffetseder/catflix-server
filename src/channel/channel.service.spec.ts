import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from '../video/repositories/category.repository';
import { VideoRepository } from '../video/repositories/video.repository';
import { YouTubeService } from '../youtube/youtube.service';
import { ChannelService } from './channel.service';
import { ChannelRepository } from './repositories/channel.repository';

describe('ChannelService', () => {
  let service: ChannelService;
  let channelRepository: jest.Mocked<ChannelRepository>;
  let videoRepository: jest.Mocked<VideoRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let youtubeService: jest.Mocked<YouTubeService>;

  const mockChannelRepository = {
    findOrCreate: jest.fn(),
    getChannels: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockVideoRepository = {
    findByYoutubeId: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCategoryRepository = {
    findOrCreate: jest.fn(),
  };

  const mockYouTubeService = {
    getChannelInfo: jest.fn(),
    getChannelVideos: jest.fn(),
    getCurrentQuotaUsage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: ChannelRepository,
          useValue: mockChannelRepository,
        },
        {
          provide: VideoRepository,
          useValue: mockVideoRepository,
        },
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
        {
          provide: YouTubeService,
          useValue: mockYouTubeService,
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
    channelRepository = module.get(ChannelRepository);
    videoRepository = module.get(VideoRepository);
    categoryRepository = module.get(CategoryRepository);
    youtubeService = module.get(YouTubeService);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getChannels', () => {
    it('should return paginated channels', async () => {
      const params = { page: 1, pageSize: 10 };
      const mockChannels = [[{ id: '1', name: 'Test Channel' }], 1];

      mockChannelRepository.getChannels.mockResolvedValue(mockChannels);

      const result = await service.getChannels(params);

      expect(result).toEqual({
        data: mockChannels[0],
        total: mockChannels[1],
        page: params.page,
        pageSize: params.pageSize,
      });
      expect(channelRepository.getChannels).toHaveBeenCalledWith(params);
    });
  });

  describe('getChannel', () => {
    it('should return a channel by id', async () => {
      const channelId = '123e4567-e89b-12d3-a456-426614174000';
      const mockChannel = {
        id: channelId,
        name: 'Test Channel',
        videos: [],
      };

      mockChannelRepository.findOne.mockResolvedValue(mockChannel);

      const result = await service.getChannel(channelId);

      expect(result).toEqual(mockChannel);
      expect(channelRepository.findOne).toHaveBeenCalledWith({
        where: { id: channelId },
        relations: ['videos'],
        select: {
          id: true,
          name: true,
          description: true,
          thumbnailUrl: true,
          isActive: true,
          lastFetchedAt: true,
        },
      });
    });
  });

  describe('fetchAndStoreChannelVideos', () => {
    it('should skip fetching when quota is nearly exhausted', async () => {
      mockYouTubeService.getCurrentQuotaUsage.mockReturnValue({
        used: 9500,
        total: 10000,
      });

      await service.fetchAndStoreChannelVideos();

      expect(youtubeService.getChannelInfo).not.toHaveBeenCalled();
      expect(channelRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it('should fetch and store videos for a channel', async () => {
      mockYouTubeService.getCurrentQuotaUsage.mockReturnValue({
        used: 5000,
        total: 10000,
      });

      const mockChannel = {
        id: '1',
        name: 'Test Channel',
        description: 'Test Description',
        thumbnailUrl: 'http://example.com/thumb.jpg',
      };

      const mockCategory = {
        id: '1',
        title: 'Channel: Test Channel',
      };

      const mockVideo = {
        youtubeId: 'video1',
        title: 'Test Video',
        uploadDate: new Date(),
        length: 120,
      };

      mockYouTubeService.getChannelInfo.mockResolvedValue(mockChannel);
      mockChannelRepository.findOrCreate.mockResolvedValue(mockChannel);
      mockCategoryRepository.findOrCreate.mockResolvedValue(mockCategory);
      mockYouTubeService.getChannelVideos.mockResolvedValue([mockVideo]);
      mockVideoRepository.findByYoutubeId.mockResolvedValue(null);
      mockVideoRepository.create.mockReturnValue(mockVideo);
      mockVideoRepository.save.mockResolvedValue(mockVideo);

      await service.fetchAndStoreChannelVideos();

      expect(youtubeService.getCurrentQuotaUsage).toHaveBeenCalled();
      expect(youtubeService.getChannelInfo).toHaveBeenCalled();
      expect(channelRepository.findOrCreate).toHaveBeenCalled();
      expect(categoryRepository.findOrCreate).toHaveBeenCalled();
      expect(youtubeService.getChannelVideos).toHaveBeenCalled();
      expect(videoRepository.create).toHaveBeenCalled();
      expect(videoRepository.save).toHaveBeenCalled();
    });
  });

  describe('triggerFetchAndStore', () => {
    it('should trigger fetch and store process', async () => {
      const expectedResult = {
        message: 'Channel videos fetched and stored successfully.',
      };

      // Mock the fetchAndStoreChannelVideos method
      jest
        .spyOn(service, 'fetchAndStoreChannelVideos')
        .mockResolvedValue(undefined);

      const result = await service.triggerFetchAndStore();

      expect(result).toEqual(expectedResult);
      expect(service.fetchAndStoreChannelVideos).toHaveBeenCalled();
    });
  });
});
