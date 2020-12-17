import SlashCommand from '@lib/structures/SlashCommand';
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
