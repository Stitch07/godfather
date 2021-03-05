import Game, { Phase } from '@mafia/structures/Game';
import type Player from '@mafia/structures/Player';
import { canManage } from '@root/lib/util/utils';
import type { User } from 'discord.js';

export interface PlayerManagerShowOptions {
	codeblock?: boolean;
	showReplacements?: boolean;
}

export default class PlayerManager extends Array<Player> {
	public replacements: User[] = [];

	/**
	 * Set of ids of players that have voted to kick the host
	 */
	public voteKicks = new Set<string>();
	public constructor(public game: Game) {
		super();
	}

	public get(user: User): Player | undefined {
		return this.find((player) => player.user === user);
	}

	public async remove(player: Player, prompt = true): Promise<boolean> {
		if (player === this.game.host) throw this.game.t('game/players:removeHost');
		if (!this.game.hasStarted) {
			this.splice(this.indexOf(player), 1);
			if (this.voteKicks.has(player.user.id)) this.voteKicks.delete(player.user.id);
			return true;
		}

		if (prompt) {
			const promptMessage = this.game.t(
				this.replacements.length > 0 ? 'game/players:removeConfirmationReplace' : 'game/players:removeConfirmationModkill'
			);
			const leavePrompt = await this.game.channel.prompt(
				this.game.t('game/players:removeConfirmationPrompt', { prompt: promptMessage }),
				player.user
			);
			if (!leavePrompt) return false;
		}

		// if the player is in an informed faction, remove them from it
		if (player.role.faction.informed && this.game.factionalChannels.has(player.role.faction.name)) {
			const [factionalChannel] = this.game.factionalChannels.get(player.role.faction.name)!;
			const member = await factionalChannel.guild.members.fetch(player.user.id);
			if (member) await member.kick('Player removed from game.');
		}

		if (this.replacements.length > 0) {
			const replacement = this.replacements.shift()!;
			await this.game.channel.send(
				this.game.t('game/players:removeSuccessfulReplacement', { replacement: replacement.tag, player: player.user.tag })
			);
			await this.replace(player, replacement);
			return true;
		}

		// modkill if nobody is replacing
		const phaseStr = this.game.phase === Phase.Day ? 'D' : 'N';
		await this.game.channel.send(
			`${this.game.t('game/players:removeSuccessfulModkill', { player: player.user.tag })} ${player.displayRoleAndWill(
				this.game.phase === Phase.Night
			)}`
		);
		void player.kill(this.game.t('game/players:removeModkillReason', { phase: `${phaseStr}${this.game.cycle}` }));
		return true;
	}

	public show(options: PlayerManagerShowOptions = { codeblock: false, showReplacements: true }): string {
		const playerList = options.codeblock
			? []
			: [
					this.game.hasStarted
						? `**Players: ${this.filter((player) => player.isAlive).length}/${this.length} alive**`
						: `**Players: ${this.length}**`
			  ];
		for (const [n, player] of this.entries()) {
			let playerName = '';
			if (options.codeblock) {
				if (player.isAlive) {
					playerName = `+ ${n + 1}. ${player.user.tag} ${this.getPlayerFlags(player)}`;
				} else {
					playerName = `- ${n + 1}. ${player.user.tag} ${this.getPlayerFlags(player)}`;
				}
			} else if (player.isAlive) {
				playerName = `${n + 1}. ${player.user.tag} ${this.getPlayerFlags(player)}`;
			} else {
				playerName = `${n + 1}. ~~${player.user.tag}~~ ${this.getPlayerFlags(player)}`;
			}
			playerList.push(playerName);
		}

		if (this.replacements.length > 0 && options.showReplacements) {
			playerList.push(`\nReplacements: ${this.replacements.map((user) => user.tag).join(', ')}`);
		}

		return playerList.join('\n');
	}

	public async replace(player: Player, replacement: User) {
		if (this.game.phase === Phase.Day) {
			// remove all votes on the old player, and swap with the replacement
			if (this.game.votes.has(player.user.id)) {
				const votes = this.game.votes.get(player.user.id)!;
				this.game.votes.delete(player.user.id);
				this.game.votes.set(replacement.id, votes);
			}
		}

		player.user = replacement;
		await player.sendPM();

		if (this.game.phase === Phase.Night && Reflect.get(player.role, 'actionPhase') === Phase.Night) await player.role.onNight();
		else if (this.game.phase === Phase.Day && Reflect.get(player.role, 'actionPhase') === Phase.Day) await player.role.onDay();

		if (this.game.settings.numberedNicknames && this.game.channel.guild.me!.hasPermission('MANAGE_NICKNAMES')) {
			const member = await this.game.channel.guild!.members.fetch(player.user.id)!;
			if (this.game.channel.guild.me && canManage(this.game.channel.guild!.me, member)) {
				await member
					.setNickname(`[${this.game.players.indexOf(player) + 1}] ${member!.displayName}`)
					.then(() => this.game.numberedNicknames.add(member))
					.catch(() => null);
			}
		}
	}

	private getPlayerFlags(player: Player) {
		if (!this.game.hasStarted) return [];

		const flags = [];
		if (!player.isAlive) flags.push(player.role.display, player.deathReason);
		if (player.role.name === 'Mayor' && Reflect.get(player.role, 'hasRevealed') === true) flags.push('Mayor');
		if (player.flags.isRevived) flags.push(player.role.display, `revived N${player.flags.revivedOn}`);
		if (this.game.nightActions.protectedPlayers.includes(player)) flags.push('protected by the Guardian Angel');
		return flags.length ? `(${flags.join('; ')})` : '';
	}
}
