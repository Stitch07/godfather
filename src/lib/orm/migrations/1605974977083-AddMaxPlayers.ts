import { DEFAULT_GAME_SETTINGS } from '@lib/constants';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMaxPlayers1605974977083 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'guild_settings',
      new TableColumn({
        name: 'max_players',
        type: 'integer',
        default: DEFAULT_GAME_SETTINGS.maxPlayers,
        isNullable: false
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('guild_settings', 'max_players');
  }
}
