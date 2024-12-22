import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { YouTubeService } from '../youtube/youtube.service';
import { CategoryRepository } from './repositories/category.repository';
import { VideoRepository } from './repositories/video.repository';
import { VideoService } from './video.service';

describe('VideoService', () => {
  let service: VideoService;
  let videoRepository: jest.Mocked<VideoRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;
  let youtubeService: jest.Mocked<YouTubeService>;

  const mockVideoRepository = {
    getVideos: jest.fn(),
    findByYoutubeId: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCategoryRepository = {
    findOrCreate: jest.fn(),
    getCategoriesWithVideoCount: jest.fn(),
  };

  const mockYouTubeService = {
    searchVideos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
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

    service = module.get<VideoService>(VideoService);
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

  describe('getVideos', () => {
    it('should return paginated videos', async () => {
      const params = { page: 1, pageSize: 10 };
      const mockVideos = [[{ id: '1', title: 'Test Video' }], 1];

      mockVideoRepository.getVideos.mockResolvedValue(mockVideos);

      const result = await service.getVideos(params);

      expect(result).toEqual({
        data: mockVideos[0],
        total: mockVideos[1],
        page: params.page,
        pageSize: params.pageSize,
      });
      expect(videoRepository.getVideos).toHaveBeenCalledWith(params);
    });
  });

  describe('getVideo', () => {
    it('should return a video by id', async () => {
      const videoId = '123e4567-e89b-12d3-a456-426614174000';
      const mockVideo = { id: videoId, title: 'Test Video' };

      mockVideoRepository.findOne.mockResolvedValue(mockVideo);

      const result = await service.getVideo(videoId);

      expect(result).toEqual(mockVideo);
      expect(videoRepository.findOne).toHaveBeenCalledWith({
        where: { id: videoId },
        relations: ['category'],
        select: {
          id: true,
          title: true,
          description: true,
          uploadDate: true,
          length: true,
          category: { id: true, title: true },
          youtubeId: true,
        },
      });
    });
  });

  describe('getCategories', () => {
    it('should return categories with video count', async () => {
      const mockCategories = [{ id: '1', title: 'Featured', videoCount: 10 }];

      mockCategoryRepository.getCategoriesWithVideoCount.mockResolvedValue(
        mockCategories,
      );

      const result = await service.getCategories();

      expect(result).toEqual(mockCategories);
      expect(categoryRepository.getCategoriesWithVideoCount).toHaveBeenCalled();
    });
  });
});
