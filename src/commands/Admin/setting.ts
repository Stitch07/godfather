import { DEFAULT_GAME_SETTINGS, GUILD_SETTINGS_METADATA } from '@lib/constants';
import GodfatherCommand from '@lib/GodfatherCommand';
import type GuildSettingsEntity from '@lib/orm/entities/GuildSettings';
import GuildSettingRepository from '@lib/orm/repositories/GuildSettingRepository';
import type { GameSettings } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptions, PreconditionContainerArray } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { codeBlock } from '@sapphire/utilities';
import type { Message } from 'discord.js';
import { getCustomRepository } from 'typeorm';

@ApplyOptions<CommandOptions>({
  aliases: ['conf', 'config', 'settings', 'set'],
  description: 'Manages game and server settings.',
  detailedDescription: [
    'The settings command lets you manage game settings such as dayDuration, nightDuration and overwritePermissions',
    'If used in a channel without an ongoing game, the settings command will modify server-wide defaults.'
  ].join('\n'),
  preconditions: ['GuildOnly', { name: 'Cooldown', context: { delay: Time.Second * 5 } }]
})
export default class extends GodfatherCommand {
  public async run(message: Message, args: Args) {
    const schemaKey = await args.pickResult('gameSetting');
    const inGame = message.channel.game !== undefined;

    if (inGame) {
      if (message.author !== message.channel.game!.host.user) throw 'This command is host-only.';
    } else {
      const result = await new PreconditionContainerArray([['OwnerOnly', 'AdminOnly']]).run(message, this);
      if (!result.success) throw result.error.message;
    }

    if (!schemaKey.success) {
      // list all keys
      const output = [];
      const guildSettings = inGame ? message.channel.game!.settings : await message.guild!.readSettings();
      // only read game settings, not all Entity properties
      for (const key of Object.keys(DEFAULT_GAME_SETTINGS)) {
        const settingMetadata = GUILD_SETTINGS_METADATA.find((setting) => setting.name === key)!;
        output.push(`${key} - ${settingMetadata.display(Reflect.get(guildSettings, key))}`);
      }
      return message.channel.send(`${inGame ? '**Game Settings**' : '**Server Settings**'}: ${codeBlock('', output.join('\n'))}`);
    }

    const settingMetadata = GUILD_SETTINGS_METADATA.find((setting) => setting.name === schemaKey.value)!;
    const newSetting = await args.restResult(settingMetadata.type, { minimum: settingMetadata.minimum, maximum: settingMetadata.maximum });
    if (!newSetting.success) throw newSetting.error.message;

    const guildSettings: GameSettings | GuildSettingsEntity = inGame ? message.channel.game!.settings : await message.guild!.readSettings();
    if (Reflect.get(guildSettings, schemaKey.value) === newSetting.value)
      throw `The value of **${schemaKey.value}** is already \`${settingMetadata.display(newSetting.value)}\``;

    Reflect.set(guildSettings, schemaKey.value, newSetting.value);
    if (!inGame) await getCustomRepository(GuildSettingRepository).updateSettings(this.context.client, guildSettings as GuildSettingsEntity);

    return message.channel.send(
      `Successfully updated ${inGame ? 'game settings' : 'server defaults'} for **${schemaKey.value}** to: \`${settingMetadata.display(
        newSetting.value
      )}\``
    );
  }
}
