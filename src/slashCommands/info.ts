import SlashCommand from '@lib/structures/SlashCommand';
import type RemainingCommand from '@root/commands/Mafia/remaining';
import type { PieceContext } from '@sapphire/framework';
import type { TextChannel } from 'discord.js';
import i18next from 'i18next';

export class PlayerlistSlashCommand extends SlashCommand {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'playerlist',
			description: 'Shows you the playerlist of an ongoing game.',
			preconditions: ['GameOnly']
		});
	}

	public async run(interaction: any) {
		const channel = this.context.client.channels.cache.get(interaction.channel_id) as TextChannel;
		await this.reply(interaction, channel.game!.players.show());
	}
}

export class VotecountSlashCommand extends SlashCommand {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'votecount',
			description: 'Shows you the votecount of an ongoing game.',
			preconditions: ['GameOnly', 'GameStartedOnly', 'DayOnly']
		});
	}

	public async run(interaction: any) {
		const channel = this.context.client.channels.cache.get(interaction.channel_id) as TextChannel;
		await this.reply(interaction, channel.game!.votes.show({}));
	}
}

export class RemainingSlashCommand extends SlashCommand {
	public constructor(context: PieceContext) {
		super(context, {
			name: 'remaining',
			description: 'Shows you when the current day/night ends.',
			preconditions: ['GameOnly']
		});
	}

	public async run(interaction: any) {
		const channel = this.context.client.channels.cache.get(interaction.channel_id) as TextChannel;
		const command = this.context.client.stores.get('commands').get('remaining')! as RemainingCommand;
		await this.reply(interaction, command.getOutput(channel.game!, i18next.t));
	}
}
