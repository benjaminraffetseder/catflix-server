import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1735289181799 implements MigrationInterface {
    name = 'InitialSchema1735289181799'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "youtubeChannelId" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "thumbnailUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "lastFetchedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "totalVideos" integer NOT NULL DEFAULT '0', "lastFetchedVideoId" character varying, "isFullyIndexed" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_9aef734beb5fb09bfe7a8ca7dff" UNIQUE ("youtubeChannelId"), CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9f16dbbf263b0af0f03637fa7b5" UNIQUE ("title"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "video" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "categoryId" uuid NOT NULL, "channelId" uuid, "uploadDate" date NOT NULL, "length" integer NOT NULL, "youtubeId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fc6cf858b85534c688d43de1837" UNIQUE ("youtubeId"), CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_99e2178fda31ff2d6576447368" ON "video" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_96f2b8791f5092c6b64437e0e9" ON "video" ("uploadDate") `);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_038baf265a6504529ffb1dcff0f" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_2edd2d5b91d15d5262356ab2a5b" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_2edd2d5b91d15d5262356ab2a5b"`);
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_038baf265a6504529ffb1dcff0f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96f2b8791f5092c6b64437e0e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99e2178fda31ff2d6576447368"`);
        await queryRunner.query(`DROP TABLE "video"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "channel"`);
    }

}
