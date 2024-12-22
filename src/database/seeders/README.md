# Database Seeders

This directory contains database seeders for the Catflix Server. The seeders help you maintain a consistent development environment by providing initial data for your database.

## Available Commands

```bash
# Seed the database with initial data
$ pnpm run seed

# Clean the database (remove all data)
$ pnpm run seed:clean

# Export current database data to CSV files
$ pnpm run seed:export
```

## Data Files

The seed data is stored in CSV files in the `data` directory:

- `categories.csv` - Contains video categories (Birds, Fish, Squirrels, Featured)
- `videos.csv` - Contains video data with references to categories

## Usage Examples

### Initial Setup

```bash
# Clean the database and seed with initial data
$ pnpm run seed:clean && pnpm run seed
```

### Update Seed Data

```bash
# After making changes to the database through the API
# Export the current state to update the CSV files
$ pnpm run seed:export
```

### Development Reset

```bash
# Reset the database to a known state
$ pnpm run seed:clean && pnpm run seed
```

## File Structure

```
seeders/
├── data/               # CSV files containing seed data
│   ├── categories.csv  # Category data
│   └── videos.csv      # Video data
├── cli.module.ts       # CLI module configuration
├── clean.command.ts    # Clean database command
├── export.command.ts   # Export data command
├── seed.command.ts     # Seed database command
└── seeder.service.ts   # Core seeding logic
```
