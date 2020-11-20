import { Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { DEFAULT_GAME_SETTINGS, GUILD_SETTINGS_METADATA } from '@lib/constants';
import { codeBlock } from '@sapphire/utilities';
import { getCustomRepository } from 'typeorm';
import GuildSettingRepository from '@lib/orm/repositories/GuildSettingRepository';
import { GameSettings } from '@lib/mafia/Game';
import GuildSettingsEntity from '@lib/orm/entities/GuildSettings';
import { Time } from '@sapphire/time-utilities';

@ApplyOptions<CommandOptions>({
	aliases: ['conf', 'config', 'settings'],
	preconditions: ['GuildOnly', { entry: 'Cooldown', context: { delay: Time.Second * 5 } }, ['OwnerOnly', 'AdminOnly']]
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const schemaKey = await args.pickResult('gameSetting');
		const inGame = message.channel.game !== undefined;

		if (!schemaKey.success) {
			// list all keys
			const output = [];
			const guildSettings = inGame ? message.channel.game!.settings : await message.guild!.readSettings();
			// only read game settings, not all Entity properties
			for (const key of Object.keys(DEFAULT_GAME_SETTINGS)) {
				const settingMetadata = GUILD_SETTINGS_METADATA.find(setting => setting.name === key)!;
				output.push(`${key} - ${settingMetadata.display(Reflect.get(guildSettings, key))}`);
			}
			return message.channel.send(`${inGame ? '**Game Settings**' : '**Server Settings**'}: ${codeBlock('', output.join('\n'))}`);
		}

		const settingMetadata = GUILD_SETTINGS_METADATA.find(setting => setting.name === schemaKey.value)!;
		const newSetting = await args.restResult(settingMetadata.type, { minimum: settingMetadata.minimum, maximum: settingMetadata.maximum });
		if (!newSetting.success) throw newSetting.error.message;

		const guildSettings: GameSettings | GuildSettingsEntity = inGame ? message.channel.game!.settings : await message.guild!.readSettings();
		if (Reflect.get(guildSettings, schemaKey.value) === newSetting.value) throw `The value of **${schemaKey.value}** is already \`${settingMetadata.display(newSetting.value)}\``;

		Reflect.set(guildSettings, schemaKey.value, newSetting.value);
		if (!inGame) await getCustomRepository(GuildSettingRepository).updateSettings(this.client, guildSettings as GuildSettingsEntity);

		return message.channel.send(`Successfully updated ${inGame ? 'game settings' : 'server defaults'} for **${schemaKey.value}** to: \`${settingMetadata.display(newSetting.value)}\``);
	}

}
