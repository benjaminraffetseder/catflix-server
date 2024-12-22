import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSocialMediaLinks1734855716363 implements MigrationInterface {
    name = 'RemoveSocialMediaLinks1734855716363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "instagramUrl"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "twitterUrl"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "facebookUrl"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "websiteUrl"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "channel" ADD "websiteUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "facebookUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "twitterUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "channel" ADD "instagramUrl" character varying`);
    }

}
