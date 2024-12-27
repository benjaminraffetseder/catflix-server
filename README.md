# Catflix Server

A NestJS-based backend service for managing and serving curated cat videos from YouTube. This service handles video fetching, categorization, and delivery through a RESTful API.

## Features

- YouTube video integration and management
- Channel-based content organization
- Automated video fetching and updates
- RESTful API endpoints
- Database seeding and management
- Scheduled tasks support
- PostgreSQL database integration

## Tech Stack

- NestJS (v10)
- TypeScript
- PostgreSQL with TypeORM
- YouTube Data API v3
- Class Validator & Transformer
- Swagger/OpenAPI
- Jest for testing

## Prerequisites

- Node.js (Latest LTS version)
- pnpm (v9.9.0 or higher)
- PostgreSQL
- YouTube API Key

## Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

- Database credentials
- YouTube API key
- Other environment-specific settings

3. Start the database:

```bash
./start-database.sh
```

4. Run database migrations:

```bash
pnpm migration:run
```

## Running the Application

### Development

```bash
pnpm start:dev
```

### Production

```bash
pnpm build
pnpm start:prod
```

## Database Management

### Migrations

- Generate: `pnpm migration:generate`
- Run: `pnpm migration:run`
- Revert: `pnpm migration:revert`
- Show status: `pnpm migration:show`

### Seeding

- Seed database: `pnpm seed`
- Clean data: `pnpm seed:clean`
- Export data: `pnpm seed:export`

## Project Structure

```
src/
├── channel/          # Channel management module
├── video/            # Video management module
├── youtube/          # YouTube API integration
├── config/          # Configuration files
├── database/        # Database related files
│   └── seeders/    # Database seeding
├── middleware/      # Custom middleware
└── migrations/      # TypeORM migrations
```

## API Modules

### Video Module

- Video management and retrieval
- Category-based organization
- Pagination and filtering support

### Channel Module

- Channel information management
- Video-channel relationships
- Channel metadata handling

## Testing

```bash
# Unit tests
pnpm test

# e2e tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Development

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Format code
pnpm format

# Lint code
pnpm lint
```

### API Documentation

API documentation is available through Swagger UI at `/api` when running the server.

## License

This project is [MIT licensed](LICENSE).

## About

Created with ♥️ by me, inspired by my cat's love for wildlife videos. Feel free to contribute or report issues!
