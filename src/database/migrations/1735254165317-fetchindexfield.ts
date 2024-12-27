import { MigrationInterface, QueryRunner } from "typeorm";

export class Fetchindexfield1735254165317 implements MigrationInterface {
    name = 'Fetchindexfield1735254165317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" ADD "totalVideos" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "lastFetchedVideoId" character varying`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "isFullyIndexed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "isFullyIndexed"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "lastFetchedVideoId"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "totalVideos"`);
    }

}
