import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

/**
 * Represents a video fetched from YouTube API with essential metadata.
 * @interface YouTubeVideo
 */
export interface YouTubeVideo {
  /** Unique identifier of the video on YouTube */
  youtubeId: string;
  /** Title of the video */
  title: string;
  /** Description of the video */
  description: string;
  /** Upload date of the video */
  uploadDate: Date;
  /** Duration of the video in seconds */
  length: number;
  /** URL of the highest quality thumbnail available */
  thumbnail: string;
}

/**
 * Represents a channel fetched from YouTube API with essential metadata.
 * @interface YouTubeChannel
 */
export interface YouTubeChannel {
  /** Unique identifier of the channel on YouTube */
  id: string;
  /** Name of the channel */
  name: string;
  /** Description of the channel */
  description: string;
  /** URL of the channel's thumbnail */
  thumbnailUrl: string;
  /** Social media links from channel description */
  socialLinks: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
}

/**
 * Service for interacting with the YouTube Data API v3.
 * Handles video searching with quota management and rate limiting.
 *
 * The service implements several protective measures:
 * 1. Quota tracking: Monitors and limits daily API usage
 * 2. Rate limiting: Enforces delays between requests
 * 3. Auto-reset: Resets quota counters daily at midnight UTC
 *
 * YouTube API Quota Costs:
 * - Search operation (search.list): 100 units
 * - Video details (videos.list): 1 unit per video
 * - Daily quota limit: 2000 units (reduced from standard 10,000 for safety)
 *
 * @example
 * ```typescript
 * // Fetch cat videos
 * const videos = await youtubeService.searchVideos('funny cats', 10);
 * ```
 */
@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);
  private readonly youtube;

  /** Maximum number of quota units allowed per day */
  private static readonly DAILY_QUOTA_LIMIT = 5000;
  /** Cost in quota units for a single search.list operation */
  private static readonly SEARCH_COST = 100;
  /** Cost in quota units for a single video in videos.list operation */
  private static readonly VIDEO_DETAILS_COST = 1;
  /** Minimum delay between API requests in milliseconds */
  private static readonly REQUEST_DELAY_MS = 100;
  /** Minimum video length in seconds (15 minutes) */
  private static readonly MIN_VIDEO_LENGTH = 15 * 60;

  /** Current quota units used today */
  private quotaUsed = 0;
  /** Timestamp of the last API request */
  private lastRequestTime = 0;

  /**
   * Creates an instance of YouTubeService.
   * Initializes the YouTube API client and sets up quota reset scheduling.
   *
   * @param configService - NestJS config service for accessing environment variables
   * @throws {Error} If YOUTUBE_API_KEY is not defined in environment variables
   */
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('YOUTUBE_API_KEY');
    if (!apiKey) {
      throw new Error(
        'YOUTUBE_API_KEY is not defined in environment variables',
      );
    }

    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });

    // Reset quota at midnight UTC
    this.scheduleQuotaReset();
  }

  /**
   * Schedules the next quota reset at midnight UTC.
   * This method recursively schedules itself to ensure continuous operation.
   *
   * @private
   */
  private scheduleQuotaReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    const timeUntilReset = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.quotaUsed = 0;
      this.scheduleQuotaReset();
    }, timeUntilReset);
  }

  /**
   * Enforces a minimum delay between API requests to prevent rate limiting.
   * If a request is made too soon after the previous one, this method will
   * delay execution until the minimum time has passed.
   *
   * @private
   * @returns Promise that resolves when it's safe to make the next request
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < YouTubeService.REQUEST_DELAY_MS) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          YouTubeService.REQUEST_DELAY_MS - timeSinceLastRequest,
        ),
      );
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Checks if the requested operations would exceed the remaining quota.
   * Updates the quota usage if the check passes.
   *
   * @private
   * @param searchCount - Number of search.list operations to perform
   * @param videoDetailsCount - Number of videos to fetch details for
   * @throws {Error} If the operation would exceed the remaining quota
   */
  private checkQuota(searchCount: number, videoDetailsCount: number): void {
    const requiredQuota =
      searchCount * YouTubeService.SEARCH_COST +
      videoDetailsCount * YouTubeService.VIDEO_DETAILS_COST;

    const remainingQuota = YouTubeService.DAILY_QUOTA_LIMIT - this.quotaUsed;

    if (requiredQuota > remainingQuota) {
      throw new Error(
        `Daily YouTube API quota would be exceeded. Required: ${requiredQuota}, Remaining: ${remainingQuota}`,
      );
    }

    this.quotaUsed += requiredQuota;
    this.logger.log(
      `YouTube API quota used: ${this.quotaUsed}/${YouTubeService.DAILY_QUOTA_LIMIT}`,
    );
  }

  /**
   * Searches for YouTube videos matching the given query.
   * This method performs two API calls:
   * 1. search.list to find matching videos
   * 2. videos.list to fetch detailed information about the found videos
   *
   * The method includes quota checking and rate limiting for both calls.
   *
   * @param query - The search query to find videos
   * @param maxResults - Maximum number of videos to return (default: 50)
   * @returns Promise resolving to an array of YouTubeVideo objects
   * @throws {Error} If quota would be exceeded or API calls fail
   *
   * @example
   * ```typescript
   * // Search for 5 cat videos
   * const catVideos = await youtubeService.searchVideos('cats', 5);
   * ```
   */
  async searchVideos(
    query: string,
    maxResults = 50,
    pageToken?: string,
    accumulatedResults: YouTubeVideo[] = [],
  ): Promise<YouTubeVideo[]> {
    try {
      // Calculate remaining results needed
      const remainingResults = maxResults - accumulatedResults.length;
      // Limit per page (YouTube max is 50)
      const pageSize = Math.min(remainingResults, 50);

      // Check if we have enough quota for the worst case (one search + pageSize video details)
      this.checkQuota(1, pageSize);

      // Enforce rate limit before search request
      await this.enforceRateLimit();

      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        maxResults: pageSize,
        q: query,
        type: ['video'],
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
        pageToken,
      });

      if (!searchResponse.data.items?.length) {
        return accumulatedResults;
      }

      const videoIds = searchResponse.data.items
        .map((item) => item.id?.videoId)
        .filter(Boolean);

      // Enforce rate limit before video details request
      await this.enforceRateLimit();

      const detailsResponse = await this.youtube.videos.list({
        part: ['contentDetails', 'snippet'],
        id: videoIds,
      });

      const newVideos = (detailsResponse.data.items ?? [])
        .map((item) => {
          const length = this.parseDuration(item.contentDetails!.duration!);
          return {
            youtubeId: item.id!,
            title: item.snippet!.title!,
            description: item.snippet!.description!,
            uploadDate: new Date(item.snippet!.publishedAt!),
            length,
            thumbnail:
              item.snippet!.thumbnails?.maxres?.url ||
              item.snippet!.thumbnails?.high?.url ||
              `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
          };
        })
        .filter((video) => video.length >= YouTubeService.MIN_VIDEO_LENGTH);

      const allResults = [...accumulatedResults, ...newVideos];

      // If we haven't reached maxResults and there are more pages, continue fetching
      if (
        allResults.length < maxResults &&
        searchResponse.data.nextPageToken &&
        searchResponse.data.pageInfo?.totalResults! > allResults.length
      ) {
        return this.searchVideos(
          query,
          maxResults,
          searchResponse.data.nextPageToken,
          allResults,
        );
      }

      // Return results, trimmed to maxResults
      return allResults.slice(0, maxResults);
    } catch (error) {
      this.logger.error('Error fetching videos from YouTube:', error);
      throw error;
    }
  }

  /**
   * Parses YouTube's duration format (ISO 8601) into seconds.
   * Handles formats like: PT1H2M10S (1 hour, 2 minutes, 10 seconds)
   *
   * @private
   * @param duration - ISO 8601 duration string
   * @returns Total duration in seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const [, hours, minutes, seconds] = match;
    return (
      parseInt(hours || '0') * 3600 +
      parseInt(minutes || '0') * 60 +
      parseInt(seconds || '0')
    );
  }

  /**
   * Returns the current quota usage statistics.
   * Useful for monitoring API usage and implementing warning systems.
   *
   * @returns Object containing used and total quota units
   *
   * @example
   * ```typescript
   * const { used, total } = youtubeService.getCurrentQuotaUsage();
   * const percentageUsed = (used / total) * 100;
   * ```
   */
  getCurrentQuotaUsage(): { used: number; total: number } {
    return {
      used: this.quotaUsed,
      total: YouTubeService.DAILY_QUOTA_LIMIT,
    };
  }

  /**
   * Get channel information by channel name
   */
  async getChannelInfo(channelName: string): Promise<YouTubeChannel> {
    try {
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: channelName,
        type: ['channel'],
        maxResults: 1,
        key: this.configService.get('YOUTUBE_API_KEY'),
      });

      this.quotaUsed += 100;

      if (!searchResponse.data.items?.length) {
        throw new Error(`Channel ${channelName} not found`);
      }

      const channelId = searchResponse.data.items[0].id.channelId;
      const channelResponse = await this.youtube.channels.list({
        part: ['snippet', 'brandingSettings'],
        id: [channelId],
        key: this.configService.get('YOUTUBE_API_KEY'),
      });

      this.quotaUsed += 1;

      if (!channelResponse.data.items?.length) {
        throw new Error(`Channel ${channelName} details not found`);
      }

      const channel = channelResponse.data.items[0];
      const description = channel.snippet.description;

      // Extract social media links from description
      const socialLinks = {
        instagram: this.extractSocialLink(description, 'instagram.com'),
        twitter: this.extractSocialLink(description, 'twitter.com'),
        facebook: this.extractSocialLink(description, 'facebook.com'),
        website: this.extractWebsiteLink(description),
      };

      return {
        id: channel.id,
        name: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl: channel.snippet.thumbnails.high?.url || '',
        socialLinks,
      };
    } catch (error) {
      this.logger.error(
        `Error getting channel info for ${channelName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Extracts social media link from channel description
   * @private
   */
  private extractSocialLink(
    description: string,
    domain: string,
  ): string | undefined {
    const regex = new RegExp(
      `https?:\\/\\/(?:www\\.)?${domain.replace('.', '\\.')}\\S+`,
      'i',
    );
    const match = description.match(regex);
    return match ? match[0] : undefined;
  }

  /**
   * Extracts website link from channel description
   * @private
   */
  private extractWebsiteLink(description: string): string | undefined {
    const regex =
      /https?:\/\/(?!(?:www\.)?(instagram|twitter|facebook)\.com)\S+/i;
    const match = description.match(regex);
    return match ? match[0] : undefined;
  }

  /**
   * Get videos from a specific channel
   */
  async getChannelVideos(
    channelId: string,
    pageToken?: string,
    lastFetchedVideoId?: string,
  ): Promise<{
    videos: YouTubeVideo[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    try {
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        channelId,
        type: ['video'],
        maxResults: 50,
        order: 'date',
        pageToken,
        key: this.configService.get('YOUTUBE_API_KEY'),
      });

      this.quotaUsed += 100;

      if (!searchResponse.data.items?.length) {
        return {
          videos: [],
          totalResults: searchResponse.data.pageInfo?.totalResults || 0,
        };
      }

      const videoIds = searchResponse.data.items.map((item) => item.id.videoId);

      // If we've reached the last fetched video, stop here
      if (lastFetchedVideoId) {
        const lastFetchedIndex = videoIds.indexOf(lastFetchedVideoId);
        if (lastFetchedIndex !== -1) {
          // Only take videos up to the last fetched one
          videoIds.splice(lastFetchedIndex);
          if (videoIds.length === 0) {
            return {
              videos: [],
              totalResults: searchResponse.data.pageInfo?.totalResults || 0,
            };
          }
        }
      }

      const videosResponse = await this.youtube.videos.list({
        part: ['contentDetails', 'snippet'],
        id: videoIds,
        key: this.configService.get('YOUTUBE_API_KEY'),
      });

      this.quotaUsed += 1;

      const videos = (videosResponse.data.items || [])
        .map((video) => {
          const length = this.parseDuration(video.contentDetails.duration);
          return {
            youtubeId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            uploadDate: new Date(video.snippet.publishedAt),
            length,
            thumbnail: video.snippet.thumbnails.high?.url || '',
          };
        })
        .filter((video) => video.length >= YouTubeService.MIN_VIDEO_LENGTH);

      return {
        videos,
        nextPageToken: searchResponse.data.nextPageToken,
        totalResults: searchResponse.data.pageInfo?.totalResults || 0,
      };
    } catch (error) {
      this.logger.error(
        `Error getting videos for channel ${channelId}:`,
        error,
      );
      throw error;
    }
  }
}
