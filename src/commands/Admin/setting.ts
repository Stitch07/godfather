import { Args, CommandOptions } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import GodfatherCommand from '@lib/GodfatherCommand';
import { Message } from 'discord.js';
import { DEFAULT_GAME_SETTINGS, GUILD_SETTINGS_METADATA } from '@root/lib/constants';
import { codeBlock } from '@sapphire/utilities';
import { getCustomRepository } from 'typeorm';
import GuildSettingRepository from '@root/lib/orm/repositories/GuildSettingRepository';
import { GameSettings } from '@root/lib/mafia/Game';
import GuildSettingsEntity from '@root/lib/orm/entities/GuildSettings';

@ApplyOptions<CommandOptions>({
	preconditions: ['GuildOnly', ['OwnerOnly', 'AdminOnly']]
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
		const newSetting = await args.rest(settingMetadata.type, { minimum: settingMetadata.minimum, maximum: settingMetadata.maximum })
			.catch(error => { throw error.message; });
		if (!newSetting) throw `Missing value for "${schemaKey.value}".`;

		const guildSettings: GameSettings | GuildSettingsEntity = inGame ? message.channel.game!.settings : await message.guild!.readSettings();
		Reflect.set(guildSettings, schemaKey.value, newSetting);
		if (!inGame) await getCustomRepository(GuildSettingRepository).updateSettings(this.client, guildSettings as GuildSettingsEntity);

		return message.channel.send(`Successfully updated ${inGame ? 'game settings' : 'server defaults'} for **${schemaKey.value}** to: \`${settingMetadata.display(newSetting)}\``);
	}

}
