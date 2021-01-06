import { ENABLE_PRIVATE_CHANNELS, PRIVATE_CHANNEL_SERVER } from '@root/config';
import { Event, Events, PieceContext } from '@sapphire/framework';
import { GuildMember } from 'discord.js';

export default class extends Event<Events.GuildMemberAdd> {

	public constructor(context: PieceContext) {
		super(context, { event: Events.GuildMemberAdd });
	}

	public async run(member: GuildMember) {
		if (!ENABLE_PRIVATE_CHANNELS || member.guild.id !== PRIVATE_CHANNEL_SERVER) return;
		for (const game of this.context.client.games.values()) {
			const player = game.players.get(member.user);
			if (!player || !game.factionalChannels.has(player.role.faction.name)) return;
			const [factionalChannel] = game.factionalChannels.get(player.role.faction.name)!;
			await factionalChannel.updateOverwrite(member, {
				SEND_MESSAGES: true,
				VIEW_CHANNEL: true,
				READ_MESSAGE_HISTORY: true
			});
		}
	}

}
