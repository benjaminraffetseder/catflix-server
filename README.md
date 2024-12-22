<p align="center">
  <h1>🐱 Catflix Server</h1>
  <p>Backend service for Catflix - A Netflix-inspired platform for your cat</p>
</p>

## Overview

Catflix Server is a backend service built with NestJS that powers the Catflix platform. It integrates with YouTube's API to fetch and manage cat videos, providing a curated streaming experience through a REST API.

### Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **API Integration**: YouTube Data API v3
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Task Scheduling**: @nestjs/schedule with cron jobs

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- PostgreSQL database
- YouTube Data API key
- Docker

### Environment Setup

1. Clone the repository:
```bash
$ git clone https://github.com/benjaminraffetseder/catflix-server.git
$ cd catflix-server
```

2. Install dependencies:
```bash
$ pnpm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   ```bash
   $ cp .env.example .env
   ```	
   - Fill in the required variables:
     ```
     YOUTUBE_API_KEY=your_youtube_api_key
     DATABASE_URL=postgresql://user:password@localhost:5432/catflix
     PORT=3000
     NODE_ENV=development
     MANUAL_FETCH_API_KEY=your_api_key_for_manual_fetching
     ```

4. Set up the database:
```bash
# Run TypeORM migrations
$ pnpm run migration:run
```

## Development

```bash
# Start in development mode with hot-reload
$ pnpm run start:dev

# Run unit tests
$ pnpm run test

# Run e2e tests
$ pnpm run test:e2e

# Check test coverage
$ pnpm run test:cov
```

## Database Migrations

```bash
# Generate a new migration
$ pnpm run migration:generate src/migrations/MigrationName

# Create a new empty migration
$ pnpm run migration:create src/migrations/MigrationName

# Run pending migrations
$ pnpm run migration:run

# Revert last migration
$ pnpm run migration:revert

# Show migration status
$ pnpm run migration:show
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

You can also download the JSON documentation at:
```
http://localhost:3000/api-json
```

## Project Structure

```
src/
├── config/          # Configuration files and environment setup
├── entities/        # TypeORM entities
├── migrations/      # Database migrations
├── middleware/      # HTTP middleware
├── video/           # Video module (Fetching and storing YT video data)
└── main.ts          # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is [MIT licensed](LICENSE).
