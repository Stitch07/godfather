import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLanguageSupport1612342810077 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "guild_settings" ADD "language" character varying NOT NULL DEFAULT 'en-US'`);
		await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "independent_wins"`);
		await queryRunner.query(`ALTER TABLE "games" ADD "independent_wins" character varying(30) array NOT NULL DEFAULT ARRAY[]::VARCHAR[]`);
		await queryRunner.query(`COMMENT ON COLUMN "guild_settings"."prefix" IS NULL`);
		await queryRunner.query(`ALTER TABLE "guild_settings" ALTER COLUMN "prefix" SET DEFAULT 'gd!'`);
		await queryRunner.query(`ALTER TABLE "guild_settings" DROP COLUMN "disabled_channels"`);
		await queryRunner.query(
			`ALTER TABLE "guild_settings" ADD "disabled_channels" character varying(19) array NOT NULL DEFAULT ARRAY[]::VARCHAR[]`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "guild_settings" DROP COLUMN "disabled_channels"`);
		await queryRunner.query(`ALTER TABLE "guild_settings" ADD "disabled_channels" character varying array NOT NULL DEFAULT ARRAY[]`);
		await queryRunner.query(`ALTER TABLE "guild_settings" ALTER COLUMN "prefix" SET DEFAULT 'g!'`);
		await queryRunner.query(`COMMENT ON COLUMN "guild_settings"."prefix" IS NULL`);
		await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "independent_wins"`);
		await queryRunner.query(`ALTER TABLE "games" ADD "independent_wins" character varying array NOT NULL DEFAULT ARRAY[]`);
		await queryRunner.query(`ALTER TABLE "guild_settings" DROP COLUMN "language"`);
	}
}
