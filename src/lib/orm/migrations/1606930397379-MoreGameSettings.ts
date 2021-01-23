import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const BOOLEAN_SETTINGS = ['mute_at_night', 'adaptive_slowmode', 'numbered_nicknames'];

export class MoreGameSettings1606930397379 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'guild_settings',
      new TableColumn({
        name: 'disabled_channels',
        type: 'varchar',
        default: 'ARRAY[]::VARCHAR[]',
        isNullable: false,
        isArray: true
      })
    );

    for (const setting of BOOLEAN_SETTINGS) {
      await queryRunner.addColumn(
        'guild_settings',
        new TableColumn({
          name: setting,
          type: 'boolean',
          default: false
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('guild_settings', 'disabled_channels');
    for (const setting of BOOLEAN_SETTINGS) {
      await queryRunner.dropColumn('guild_settings', setting);
    }
  }
}
