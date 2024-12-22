import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

describe('VideoController', () => {
  let controller: VideoController;
  let videoService: jest.Mocked<VideoService>;
  let configService: jest.Mocked<ConfigService>;

  const mockVideoService = {
    getVideos: jest.fn(),
    getCategories: jest.fn(),
    triggerFetchAndStore: jest.fn(),
    getVideo: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: VideoService,
          useValue: mockVideoService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
    videoService = module.get(VideoService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getVideos', () => {
    it('should return videos based on query parameters', async () => {
      const query = { page: 1, pageSize: 10 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
      };

      mockVideoService.getVideos.mockResolvedValue(expectedResult);

      const result = await controller.getVideos(query);

      expect(result).toEqual(expectedResult);
      expect(videoService.getVideos).toHaveBeenCalledWith(query);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const expectedCategories = [
        { id: '1', title: 'Featured', videoCount: 10 },
      ];

      mockVideoService.getCategories.mockResolvedValue(expectedCategories);

      const result = await controller.getCategories();

      expect(result).toEqual(expectedCategories);
      expect(videoService.getCategories).toHaveBeenCalled();
    });
  });

  describe('triggerFetchAndStore', () => {
    it('should trigger fetch and store when valid API key is provided', async () => {
      const apiKey = 'valid-key';
      const expectedResult = {
        message: 'Videos fetched and stored successfully.',
      };

      mockConfigService.get.mockReturnValue(apiKey);
      mockVideoService.triggerFetchAndStore.mockResolvedValue(expectedResult);

      const result = await controller.triggerFetchAndStore(apiKey);

      expect(result).toEqual(expectedResult);
      expect(configService.get).toHaveBeenCalledWith('MANUAL_FETCH_API_KEY');
      expect(videoService.triggerFetchAndStore).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when invalid API key is provided', async () => {
      const apiKey = 'invalid-key';

      mockConfigService.get.mockReturnValue('valid-key');

      await expect(controller.triggerFetchAndStore(apiKey)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(videoService.triggerFetchAndStore).not.toHaveBeenCalled();
    });
  });

  describe('getVideo', () => {
    it('should return a video when it exists', async () => {
      const videoId = '123e4567-e89b-12d3-a456-426614174000';
      const expectedVideo = {
        id: videoId,
        title: 'Test Video',
      };

      mockVideoService.getVideo.mockResolvedValue(expectedVideo);

      const result = await controller.getVideo(videoId);

      expect(result).toEqual(expectedVideo);
      expect(videoService.getVideo).toHaveBeenCalledWith(videoId);
    });

    it('should throw NotFoundException when video does not exist', async () => {
      const videoId = '123e4567-e89b-12d3-a456-426614174000';

      mockVideoService.getVideo.mockResolvedValue(null);

      await expect(controller.getVideo(videoId)).rejects.toThrow(
        NotFoundException,
      );
      expect(videoService.getVideo).toHaveBeenCalledWith(videoId);
    });
  });
});
