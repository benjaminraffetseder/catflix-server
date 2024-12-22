import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from './repositories/category.repository';
import { VideoRepository } from './repositories/video.repository';
import { YouTubeService } from './services/youtube.service';
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
    getCurrentQuotaUsage: jest.fn(),
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

  describe('fetchAndStoreVideos', () => {
    it('should skip fetching when quota is nearly exhausted', async () => {
      mockYouTubeService.getCurrentQuotaUsage.mockReturnValue({
        used: 9500,
        total: 10000,
      });

      await service.fetchAndStoreVideos();

      expect(youtubeService.searchVideos).not.toHaveBeenCalled();
      expect(categoryRepository.findOrCreate).not.toHaveBeenCalled();
    });

    it('should fetch and store videos for each category', async () => {
      mockYouTubeService.getCurrentQuotaUsage.mockReturnValue({
        used: 5000,
        total: 10000,
      });

      const mockCategory = { id: '1', title: 'Featured' };
      const mockVideo = {
        youtubeId: 'video1',
        title: 'Test Video',
        uploadDate: new Date(),
        length: 120,
      };

      mockCategoryRepository.findOrCreate.mockResolvedValue(mockCategory);
      mockYouTubeService.searchVideos.mockResolvedValue([mockVideo]);
      mockVideoRepository.findByYoutubeId.mockResolvedValue(null);
      mockVideoRepository.create.mockReturnValue(mockVideo);
      mockVideoRepository.save.mockResolvedValue(mockVideo);

      await service.fetchAndStoreVideos();

      expect(youtubeService.getCurrentQuotaUsage).toHaveBeenCalled();
      expect(categoryRepository.findOrCreate).toHaveBeenCalled();
      expect(youtubeService.searchVideos).toHaveBeenCalled();
      expect(videoRepository.create).toHaveBeenCalled();
      expect(videoRepository.save).toHaveBeenCalled();
    });
  });

  describe('triggerFetchAndStore', () => {
    it('should trigger fetch and store process', async () => {
      const expectedResult = {
        message: 'Videos fetched and stored successfully.',
      };

      // Mock the fetchAndStoreVideos method
      jest.spyOn(service, 'fetchAndStoreVideos').mockResolvedValue();

      const result = await service.triggerFetchAndStore();

      expect(result).toEqual(expectedResult);
      expect(service.fetchAndStoreVideos).toHaveBeenCalled();
    });
  });
});
