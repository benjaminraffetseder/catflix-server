import { MigrationInterface, QueryRunner } from "typeorm";

export class VideoDescriptionField1734853819266 implements MigrationInterface {
    name = 'VideoDescriptionField1734853819266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" ADD "description" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "description"`);
    }

}
