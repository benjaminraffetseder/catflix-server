import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChannelRelation1734848805733 implements MigrationInterface {
    name = 'AddChannelRelation1734848805733'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "youtubeChannelId" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "thumbnailUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "lastFetchedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9aef734beb5fb09bfe7a8ca7dff" UNIQUE ("youtubeChannelId"), CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "video" ADD "channelId" uuid`);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_2edd2d5b91d15d5262356ab2a5b" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_2edd2d5b91d15d5262356ab2a5b"`);
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "channelId"`);
        await queryRunner.query(`DROP TABLE "channel"`);
    }

}
