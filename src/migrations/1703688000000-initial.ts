import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1703688000000 implements MigrationInterface {
    name = 'Initial1703688000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Category table
        await queryRunner.query(`
            CREATE TABLE "category" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_category_title" UNIQUE ("title"),
                CONSTRAINT "PK_category" PRIMARY KEY ("id")
            )
        `);

        // Create Channel table
        await queryRunner.query(`
            CREATE TABLE "channel" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "youtubeChannelId" character varying NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying,
                "thumbnailUrl" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "lastFetchedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "totalVideos" integer NOT NULL DEFAULT 0,
                "lastFetchedVideoId" character varying,
                "isFullyIndexed" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_channel_youtubeChannelId" UNIQUE ("youtubeChannelId"),
                CONSTRAINT "PK_channel" PRIMARY KEY ("id")
            )
        `);

        // Create Video table
        await queryRunner.query(`
            CREATE TABLE "video" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" character varying NOT NULL,
                "categoryId" uuid NOT NULL,
                "channelId" uuid,
                "uploadDate" date NOT NULL,
                "length" integer NOT NULL,
                "youtubeId" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_video_youtubeId" UNIQUE ("youtubeId"),
                CONSTRAINT "PK_video" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_video_title" ON "video" ("title")`);
        await queryRunner.query(`CREATE INDEX "IDX_video_uploadDate" ON "video" ("uploadDate")`);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "video" 
            ADD CONSTRAINT "FK_video_category" 
            FOREIGN KEY ("categoryId") 
            REFERENCES "category"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "video" 
            ADD CONSTRAINT "FK_video_channel" 
            FOREIGN KEY ("channelId") 
            REFERENCES "channel"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_video_channel"`);
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_video_category"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_video_uploadDate"`);
        await queryRunner.query(`DROP INDEX "IDX_video_title"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "video"`);
        await queryRunner.query(`DROP TABLE "channel"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }
} 