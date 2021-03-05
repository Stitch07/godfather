import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ConsistentSettings1614970185864 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// change column names
		await queryRunner.query('ALTER TABLE "guild_settings" RENAME COLUMN "disable_wills" TO "wills"');
		await queryRunner.query('ALTER TABLE "guild_settings" RENAME COLUMN "disable_whispers" TO "whispers"');
		await queryRunner.query('ALTER TABLE "guild_settings" RENAME COLUMN "enable_trials" TO "trials"');
		await queryRunner.query('ALTER TABLE "guild_settings" RENAME COLUMN "enable_plurality" TO "plurality_votes"');

		// retain default behavior (disable_wills -> true becomes enableWills -> false)
		await queryRunner.query('UPDATE "guild_settings" SET "wills" = NOT "wills"');
		await queryRunner.query('UPDATE "guild_settings" SET "whispers" = NOT "whispers"');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query('ALTER TABLE "guild_settings" RENAME COLUMN "wills" TO "disable_wills"');
		await queryRunner.query('ALTER TABLE "guild_settings" RENAME COLUMN "whispers" TO "disable_whispers"');
		await queryRunner.query('ALTER TABLE "guild_settings" RENAME COLUMN "trials" TO "enable_trials"');
		await queryRunner.query('ALTER TABLE "guild_settings" RENAME COLUMN "plurality_votes" TO "enable_plurality"');

		await queryRunner.query('UPDATE "guild_settings" SET "disable_wills" = NOT "disable_wills"');
		await queryRunner.query('UPDATE "guild_settings" SET "disable_whispers" = NOT "disable_whispers"');
	}
}
