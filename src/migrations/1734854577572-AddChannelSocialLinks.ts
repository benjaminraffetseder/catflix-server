import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChannelSocialLinks1734854577572 implements MigrationInterface {
  name = 'AddChannelSocialLinks1734854577572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "channel" ADD "instagramUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "channel" ADD "twitterUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "channel" ADD "facebookUrl" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "channel" ADD "websiteUrl" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "websiteUrl"`);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "facebookUrl"`);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "twitterUrl"`);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "instagramUrl"`);
  }
}
