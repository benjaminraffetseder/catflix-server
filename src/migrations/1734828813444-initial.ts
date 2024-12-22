import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1734828813444 implements MigrationInterface {
    name = 'Initial1734828813444'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9f16dbbf263b0af0f03637fa7b5" UNIQUE ("title"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "video" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "categoryId" uuid NOT NULL, "uploadDate" date NOT NULL, "length" integer NOT NULL, "youtubeId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fc6cf858b85534c688d43de1837" UNIQUE ("youtubeId"), CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_99e2178fda31ff2d6576447368" ON "video" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_96f2b8791f5092c6b64437e0e9" ON "video" ("uploadDate") `);
        await queryRunner.query(`ALTER TABLE "video" ADD CONSTRAINT "FK_038baf265a6504529ffb1dcff0f" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP CONSTRAINT "FK_038baf265a6504529ffb1dcff0f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_96f2b8791f5092c6b64437e0e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99e2178fda31ff2d6576447368"`);
        await queryRunner.query(`DROP TABLE "video"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }

}
