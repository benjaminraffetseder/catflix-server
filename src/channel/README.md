# Channel Module

## Overview

The Channel module is responsible for managing YouTube channels and their videos within the Catflix application. It provides functionality to track specific YouTube channels, automatically fetch their videos, and store them.

## Features

### Channel Management

- Track and manage YouTube channels
- Automatic video fetching from channels

### Automatic Video Fetching

- Fetches videos every 6 hours from configured channels
- YouTube API quota management
- Intelligent handling of duplicate videos
- Automatic categorization of channel videos

### REST API Endpoints

#### Get Channels

```http
GET /channels
```

Query Parameters:

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)
- `isActive` (optional): Filter by channel status

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Channel Name",
      "description": "Channel Description",
      "thumbnailUrl": "https://...",
      "isActive": true,
      "lastFetchedAt": "2023-12-22T..."
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20
}
```

#### Get Channel by ID

```http
GET /channels/:id
```

Response includes channel details and associated videos.

#### Trigger Video Fetch

```http
GET /channels/fetch/trigger
```

Manually triggers the video fetching process.

## Configuration

### Channel List

Channels are configured in `channel.service.ts`:

```typescript
const CHANNELS = [
  'fourpawstv',
  'PaulDinningVideosforCats',
  'BirderKing',
  // ...
] as const;
```

### Dependencies

- VideoModule: For video management
- YouTubeModule: For YouTube API interactions
- TypeORM: For database operations

## Database Schema

### Channel Entity

```typescript
@Entity()
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  youtubeChannelId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp' })
  lastFetchedAt: Date;

  @OneToMany(() => Video, video => video.channel)
  videos: Video[];
}
```

## Usage

### Module Import

```typescript
import { Module } from '@nestjs/common';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [ChannelModule],
})
export class AppModule {}
```

### Service Injection

```typescript
constructor(private readonly channelService: ChannelService) {}
```

### Manual Video Fetch

```typescript
await channelService.triggerFetchAndStore();
```

## Error Handling

- YouTube API quota management
- Duplicate video handling
- Channel not found scenarios
- Video processing errors

## Testing

The module includes comprehensive tests:

- Unit tests for service methods
- Controller endpoint tests
- Repository operation tests

Run tests:

```bash
# Unit tests
npm run test src/channel

```
