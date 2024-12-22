# Video Module Documentation

## Overview

The Video Module integrates with YouTube's API to fetch, store, and serve curated videos across different categories specifically designed for cat entertainment.

## Features

- Manual video fetching from YouTube
- Category-based video organization
- RESTful API endpoints for video access
- Quota management for YouTube API usage
- Pagination and filtering support

## Technical Architecture

### Core Components

- `VideoController`: REST API endpoint handler
- `VideoService`: Core business logic implementation
- `YouTubeService`: YouTube API integration
- `VideoRepository`: Data access layer for videos
- `CategoryRepository`: Data access layer for categories

### Data Model

#### Video Entity

- UUID-based identification
- YouTube metadata (ID, title, description, upload date, length)
- Category association

## API Endpoints

### GET /videos

Retrieves a paginated list of videos with optional filtering.

```typescript
interface GetVideosParams {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  uploadDateFrom?: string;
  uploadDateTo?: string;
}

interface VideoResponse {
  data: Video[];
  total: number;
  page: number;
  pageSize: number;
}
```

Example:

```bash
curl http://localhost:3000/videos?page=1&pageSize=20&categoryId=483b0d37-9adf-4e24-ad77-717f15cd9884
```

### GET /videos/categories

Returns all available categories with their video counts.

Example:

```bash
curl http://localhost:3000/videos/categories
```

### GET /videos/:id

Retrieves a specific video by its UUID.

Example:

```bash
curl http://localhost:3000/videos/36d7322d-330c-4554-af4c-4e4a0a8e13ec
```

## Error Handling

The module implements comprehensive error handling:

- YouTube quota monitoring
- Individual video processing error isolation
- Category-level error containment
- API-level error responses (404, 401, etc.)

## Best Practices

### Rate Limiting

- YouTube API quota monitoring
- 90% quota threshold protection

### Data Consistency

- Atomic video updates
- Duplicate prevention via YouTube ID checking

### Performance

- Paginated responses
- Efficient database queries

## Configuration

### Environment Variables

```env
YOUTUBE_API_KEY=your_youtube_api_key
```

## Usage Examples

### Filtering Videos by Date Range

```typescript
const response = await fetch('/videos?uploadDateFrom=2023-01-01&uploadDateTo=2023-12-31');
const videos = await response.json();
```

### Getting Videos from Specific Category

```typescript
const response = await fetch('/videos?categoryId=bird-videos');
const videos = await response.json();
```

### Implementing Custom Video Player

```typescript
async function loadVideo(videoId: string) {
  const response = await fetch(`/videos/${videoId}`);
  const video = await response.json();
  
  return {
    youtubeId: video.youtubeId,
    title: video.title,
    description: video.description,
    category: video.category.title
  };
}
```

## Contributing

When contributing to this module:

1. Ensure all new endpoints are properly documented
2. Add appropriate error handling
3. Follow the existing TypeScript types and interfaces
4. Maintain the current error handling patterns
5. Add tests for new functionality

## Technical Considerations

### Scalability

- The module uses repository pattern for database abstraction
- Implements pagination for large datasets

### Maintenance

- Manual video fetching
- YouTube quota monitoring

### Security

- Input validation using DTOs
- Safe error handling without exposing internals

## Troubleshooting

### Common Issues

1. YouTube Quota Exceeded
   - Solution: Wait for quota reset or increase quota limit

2. Video Fetch Failures
   - Check YouTube API status
   - Verify API key validity
   - Review category search queries

3. Missing Videos
   - Verify database connectivity
   - Check video fetch logs
   - Ensure YouTube IDs are valid

## Support

For technical support or feature requests, please:

1. Check the existing documentation
2. Review the error logs
3. Contact the development team with:
   - Specific error messages
   - Relevant API responses
   - Steps to reproduce issues
