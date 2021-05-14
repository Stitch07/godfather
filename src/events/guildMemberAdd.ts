import { ENABLE_PRIVATE_CHANNELS, PRIVATE_CHANNEL_SERVER } from '@root/config';
import type Mason from '@root/lib/mafia/roles/town/Mason';
import type Role from '@root/lib/mafia/structures/Role';
import { Event, Events, PieceContext } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

export default class extends Event<Events.GuildMemberAdd> {
	public constructor(context: PieceContext) {
		super(context, { event: Events.GuildMemberAdd });
	}

	public async run(member: GuildMember) {
		if (!ENABLE_PRIVATE_CHANNELS || member.guild.id !== PRIVATE_CHANNEL_SERVER) return;
		for (const game of this.context.client.games.values()) {
			const player = game.players.get(member.user);
			const pcName = player ? this.getPcName(player.role) : null;
			if (!player || !game.factionalChannels.has(pcName!)) continue;
			const [factionalChannel] = game.factionalChannels.get(this.getPcName(player.role))!;
			await factionalChannel.updateOverwrite(member, {
				SEND_MESSAGES: true,
				VIEW_CHANNEL: true,
				READ_MESSAGE_HISTORY: true
			});
		}
	}

	private getPcName(role: Role) {
		if (role.name === 'Mason') return `mason-${(role as InstanceType<typeof Mason>).masonryIndex}`;
		return role.faction.name;
	}
}
