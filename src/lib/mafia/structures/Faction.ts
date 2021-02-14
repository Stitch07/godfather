import { PRIVATE_CHANNEL_CATEGORY, PRIVATE_CHANNEL_SERVER } from '@root/config';
import { Permissions } from 'discord.js';
import type Game from './Game';
import type Player from './Player';

export const ALLOWED_PERMISSIONS = new Permissions()
	.add(Permissions.FLAGS.VIEW_CHANNEL)
	.add(Permissions.FLAGS.SEND_MESSAGES)
	.add(Permissions.FLAGS.READ_MESSAGE_HISTORY);

class Faction {
	// whether the faction can win together, or individually
	public independent = false;
	// whether the faction is informed about their teammates
	public informed = false;
	public name = '';
	public winCondition = '';

	public async generateInvite(game: Game) {
		if (game.factionalChannels.has(this.name)) return game.factionalChannels.get(this.name)![1];

		const guild = game.client.guilds.cache.get(PRIVATE_CHANNEL_SERVER)!;
		const factionMembers = game.players.filter((player) => player.role.faction.name === this.name);

		const factionalChannel = await guild.channels.create(`${game.channel.guild.id}-${this.name}`, {
			topic: game.t('game/factions:channelTopic'),
			permissionOverwrites: [
				// deny all permissions for the everyone role
				{
					deny: Permissions.ALL,
					id: guild.id
				},
				...factionMembers.map((member) => ({
					allow: ALLOWED_PERMISSIONS,
					id: member.user.id
				}))
			],
			parent: PRIVATE_CHANNEL_CATEGORY ?? undefined
		});

		const invite = await factionalChannel.createInvite();
		game.factionalChannels.set(this.name, [factionalChannel, invite.url]);
		return invite.url;
	}
}

interface Faction {
	hasWon(game: Game): boolean;
	hasWonIndependent(player: Player): boolean;
}

export default Faction;
