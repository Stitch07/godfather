import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1602143891029 implements MigrationInterface {

	public name = 'InitialMigration1602143891029';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE "guild_settings" ("id" character varying(19) NOT NULL, "prefix" character varying(10) NOT NULL DEFAULT 'g!', CONSTRAINT "PK_259bd839beb2830fe5c2ddd2ff5" PRIMARY KEY ("id"))`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "guild_settings"`);
	}

}
