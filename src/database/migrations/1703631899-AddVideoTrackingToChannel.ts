import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVideoTrackingToChannel1703631899 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "channel"
      ADD COLUMN IF NOT EXISTS "totalVideos" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "lastFetchedVideoId" character varying,
      ADD COLUMN IF NOT EXISTS "isFullyIndexed" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "channel"
      DROP COLUMN IF EXISTS "totalVideos",
      DROP COLUMN IF EXISTS "lastFetchedVideoId",
      DROP COLUMN IF EXISTS "isFullyIndexed"
    `);
  }
}
