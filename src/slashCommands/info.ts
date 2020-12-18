import SlashCommand from '@lib/structures/SlashCommand';
import RemainingCommand from '@root/commands/Mafia/remaining';
import { PieceContext } from '@sapphire/framework';
import { TextChannel } from 'discord.js';

export class PlayerlistSlashCommand extends SlashCommand {

	public constructor(context: PieceContext) {
		super(context, {
			name: 'playerlist',
			description: 'Shows you the playerlist of an ongoing game.',
			preconditions: ['GameOnly']
		});
	}

	public async run(interaction: any) {
		const channel = this.client.channels.cache.get(interaction.channel_id) as TextChannel;
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
		const channel = this.client.channels.cache.get(interaction.channel_id) as TextChannel;
		await this.reply(interaction, channel.game!.votes.show({ }));
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
		const channel = this.client.channels.cache.get(interaction.channel_id) as TextChannel;
		const command = this.client.commands.get('remaining')! as RemainingCommand;
		await this.reply(interaction, command.getOutput(channel.game!));
	}

}
