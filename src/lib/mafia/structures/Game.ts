import type Godfather from '@lib/Godfather';
import NightActionsManager from '@mafia/managers/NightActionsManager';
import PlayerManager from '@mafia/managers/PlayerManager';
import VoteManager, { TrialVote, TrialVoteType, WeightedArrayProxy } from '@mafia/managers/VoteManager';
import type Faction from '@mafia/structures/Faction';
import Player from '@mafia/structures/Player';
import { ENABLE_PRIVATE_CHANNELS, PGSQL_ENABLED, PRIVATE_CHANNEL_SERVER } from '@root/config';
import { Time } from '@sapphire/time-utilities';
import { codeBlock } from '@sapphire/utilities';
// import { PGSQL_ENABLED } from '@root/config';
import { format } from '@util/durationFormat';
import { Collection, GuildMember, TextChannel, User } from 'discord.js';
import { getConnection, getRepository } from 'typeorm';
import { STALEMATE_PRIORITY_ORDER } from '../../constants';
import GameEntity from '../../orm/entities/Game';
import PlayerEntity from '../../orm/entities/Player';
import { canManage, fauxAlive, listItems, randomArrayItem } from '../../util/utils';
// import GameEntity from '../orm/entities/Game';
// import { getRepository } from 'typeorm';
import type SingleTarget from '../mixins/SingleTarget';
import type Setup from './Setup';

const MAX_DELAY = 15 * Time.Minute;
const TRIAL_DURATION = 30 * Time.Second;
const TRIAL_VOTING_DURATION = 30 * Time.Second;

export const enum Phase {
	Pregame = 2,
	Standby = 4,
	Day = 8,
	Trial = 16,
	TrialVoting = 32,
	Night = 64
}

export default class Game {
	public client: Godfather;
	public phase: Phase;
	public players: PlayerManager;
	public votes: VoteManager;
	public nightActions: NightActionsManager;
	/**
	 * When the current phase ends at
	 */
	public phaseEndAt?: Date = undefined;
	public cycle = 0;
	public setup?: Setup = undefined;
	/**
	 * When this game was created at - used for timing out inactive lobbies
	 */
	public createdAt!: Date;
	/**
	 * An array of user IDs of muted players
	 */
	public permissionOverwrites: string[] = [];
	/**
	 * The number of consecutive phases with zero kills
	 */
	public idlePhases = 0;
	/**
	 * A Set of players whose nicknames have been changed
	 */
	public numberedNicknames = new Set<GuildMember>();

	public factionalChannels = new Collection<string, [TextChannel, string]>();

	private dayTimeLeft = 0;

	private totalTrials = 0;

	public constructor(host: User, public channel: TextChannel, public settings: GameSettings) {
		this.client = channel.client as Godfather;
		this.phase = Phase.Pregame;
		this.players = new PlayerManager(this);
		this.players.push(new Player(host, this));
		this.votes = new VoteManager(this);
		this.nightActions = new NightActionsManager(this);
	}

	public async startDay() {
		this.phase = Phase.Standby;
		if (this.cycle !== 0 || this.setup!.nightStart) {
			const deadPlayers = await this.nightActions.resolve();
			if (deadPlayers.length > 0) {
				this.idlePhases = 0;
				const deadText = [];
				for (const deadPlayer of deadPlayers) {
					deadText.push(`${deadPlayer} died last night. ${deadPlayer.displayRoleAndWill(true)}`);
				}
				await this.channel.send(deadText.join('\n'));
			}

			this.idlePhases++;
		}

		const winCheck = this.checkEndgame();
		if (winCheck.ended) {
			await this.end(winCheck);
			return;
		}

		if (this.idlePhases === 6) {
			return this.end({ ...winCheck, winningFaction: undefined });
		}

		if (this.canOverwritePermissions) {
			for (const muted of this.players.filter((player) => player.isAlive)) {
				await this.releaseMute(muted);
			}
		}

		// start voting phase
		this.nightActions.reset();
		this.phase = Phase.Day;
		this.cycle++;
		const alivePlayers = this.players.filter((player) => player.isAlive);
		// populate voting cache
		this.votes.reset();
		this.phaseEndAt = new Date(Date.now() + this.settings.dayDuration);

		// send all day action pms
		for (const player of this.players) {
			// clear visitors
			player.visitors = [];
			if (player.isAlive && player.role.canUseAction().check && ((player.role as SingleTarget).actionPhase & Phase.Day) === Phase.Day) {
				await player.role.onDay();
			}
		}

		if (this.settings.adaptiveSlowmode && this.channel.permissionsFor(this.client.user!)?.has('MANAGE_CHANNELS'))
			await this.updateAdaptiveSlowmode();

		await this.channel.send(
			[
				`Day **${this.cycle}** will last ${format(this.settings.dayDuration)}`,
				`With ${alivePlayers.length} alive, it takes ${this.majorityVotes} to eliminate.`
			].join('\n')
		);
	}

	public async startNight() {
		const winCheck = this.checkEndgame();
		if (winCheck.ended) {
			await this.end(winCheck);
			return;
		}

		if (this.idlePhases === 6) {
			return this.end({ ...winCheck, winningFaction: undefined });
		}

		if (this.canOverwritePermissions) {
			for (const player of this.players) {
				await this.mute(player);
			}
		}

		if (this.settings.adaptiveSlowmode && this.channel.permissionsFor(this.client.user!)!.has('MANAGE_CHANNELS'))
			await this.updateAdaptiveSlowmode();

		this.phase = Phase.Standby;
		this.votes.reset();
		this.phaseEndAt = new Date(Date.now() + this.settings.nightDuration);
		this.dayTimeLeft = 0;
		this.totalTrials = 0;
		this.nightActions.protectedPlayers = [];

		await this.channel.send(`Night **${this.cycle}** will last ${format(this.settings.nightDuration)}. Send in your actions quickly!`);
		if (this.isFullMoon) await this.channel.send('Beware, tonight is a full moon 🌕');
		for (const player of this.players.filter(
			(player) => fauxAlive(player) && player.role!.canUseAction().check && (player.role! as SingleTarget).actionPhase === Phase.Night
		)) {
			await player.role!.onNight();
		}

		this.phase = Phase.Night;
	}

	public async startTrial() {
		// mute everyone except the person on trial
		if (this.canOverwritePermissions) {
			for (const player of this.players) {
				if (player.user.id === this.votes.playerOnTrial?.user.id) continue;
				await this.mute(player);
			}
		}

		await this.channel.send(`${this.votes.playerOnTrial!.user.toString()}, you have 30 seconds to convince the Town not to lynch you.`);
		this.phaseEndAt = new Date(Date.now() + TRIAL_DURATION);
		this.phase = Phase.Trial;
		this.totalTrials++;
	}

	public async startTrialVoting() {
		// unmute everyone who isn't dead
		if (this.canOverwritePermissions) {
			for (const player of this.players.filter((player) => player.isAlive && player.user.id !== this.votes.playerOnTrial?.user.id)) {
				await this.releaseMute(player);
			}
		}

		await this.channel.send(
			`The town may now vote on the Fate of ${
				this.votes.playerOnTrial!.user.tag
			}! Use the commands \`innocent\`, \`guilty\`, and \`abstain\` in Direct Messages to vote. (you have 30 seconds; ${
				this.settings.maxTrials - this.totalTrials
			} trials left today)`
		);
		this.phaseEndAt = new Date(Date.now() + TRIAL_VOTING_DURATION);
		this.phase = Phase.TrialVoting;
	}

	public async endTrial() {
		const { trialVotes: votes } = this.votes;
		let [innocentVotes, guiltyVotes, abstainingVotes] = [
			(votes.filter((vote) => vote.type === TrialVoteType.Innocent) as WeightedArrayProxy<TrialVote>).count(),
			(votes.filter((vote) => vote.type === TrialVoteType.Guilty) as WeightedArrayProxy<TrialVote>).count(),
			(votes.filter((vote) => vote.type === TrialVoteType.Abstain) as WeightedArrayProxy<TrialVote>).count()
		];

		// alive players who did not vote count as abstain
		for (const player of this.players.filter((player) => player.isAlive)) {
			if (player !== this.votes.playerOnTrial && !this.votes.trialVotes.some((vote) => vote.by === player)) {
				abstainingVotes += player.role.voteWeight;
			}
		}

		await this.channel.send(['**Votes**:\n', `Innocent: ${innocentVotes}`, `Guilty: ${guiltyVotes}`, `Abstain: ${abstainingVotes}`].join('\n'));

		const result = Math.max(innocentVotes, guiltyVotes);

		if (result === innocentVotes || innocentVotes === guiltyVotes) {
			// after max trials are reached, end day without a lynch
			if (this.totalTrials === this.settings.maxTrials) {
				this.phase = Phase.Standby;
				this.idlePhases++;
				await this.channel.send('Maximum trials reached. Nobody was eliminated!');
				await this.startNight();
			}
			if (this.dayTimeLeft !== 0) await this.channel.send(`${this.votes.playerOnTrial!.user.tag} was acquitted.`);
			// add carried over day-time
			this.phaseEndAt = new Date(Date.now() + this.dayTimeLeft);
			this.votes.reset();
			this.phase = Phase.Day;
			return;
		}

		return this.hammer(this.votes.playerOnTrial!, true);
	}

	public async hammer(player: Player, force = false) {
		// locks against multiple calls to hammer()
		this.phase = Phase.Standby;
		if (!player.isAlive) return;
		// super saint forces a hammer
		if (this.settings.enableTrials && !force && player.role.name !== 'Super Saint') {
			this.votes.playerOnTrial = player;
			// any time remaining in this day carries over
			this.dayTimeLeft = Date.now() > this.phaseEndAt!.getTime() ? 0 : this.phaseEndAt!.getTime() - Date.now();
			return this.startTrial();
		}

		await this.channel.send(
			`${player.user.tag} was hammered. ${player.displayRoleAndWill()}\n${this.votes.show({ header: 'Final Vote Count', codeblock: true })}`
		);
		await player.kill(`eliminated D${this.cycle}`);
		this.idlePhases = 0;

		await this.startNight();
	}

	public async update() {
		if (!this.hasStarted) {
			const diff = Date.now() - this.createdAt.getTime();
			if (diff > MAX_DELAY) {
				await this.channel.send('The game took too long to start!');
				return this.delete();
			}
		}

		if (this.phase === Phase.Standby) return;

		if (this.phaseEndAt && Date.now() > this.phaseEndAt.getTime()) {
			switch (this.phase) {
				case Phase.Day: {
					if (this.settings.enablePlurality) {
						let largestVoteCount = 0;
						for (const player of this.players) {
							largestVoteCount = Math.max(largestVoteCount, this.votes.on(player).count());
						}

						const candidates = this.players.filter((player) => this.votes.on(player).count() === largestVoteCount);
						const eliminatedPlayer = randomArrayItem(candidates)!;
						await this.channel.send(
							`${eliminatedPlayer.user.tag} was eliminated. ${eliminatedPlayer.displayRoleAndWill()}\n${this.votes.show({
								header: 'Final Vote Count',
								codeblock: true
							})}`
						);
						await eliminatedPlayer.kill(`eliminated D${this.cycle}`);
						this.idlePhases = 0;
					} else {
						await this.channel.send('Nobody was eliminated!');
						this.idlePhases++;
					}
					return this.startNight();
				}

				case Phase.Night: {
					return this.startDay();
				}

				case Phase.Trial: {
					return this.startTrialVoting();
				}

				case Phase.TrialVoting: {
					return this.endTrial();
				}

				case Phase.Pregame:
				// noop
			}
		}
	}

	public get host() {
		return this.players[0];
	}

	public get hasStarted(): boolean {
		return this.phase !== Phase.Pregame;
	}

	public get isFullMoon(): boolean {
		return this.cycle % 2 === 0;
	}

	public get majorityVotes(): number {
		const alivePlayers = this.players.filter((player) => player.isAlive);
		return Math.floor(alivePlayers.length / 2) + 1;
	}

	public checkEndgame(): EndgameCheckData {
		let winningFaction: Faction | undefined = undefined;
		const independentWins: Player[] = [];

		const alivePlayers = this.players.filter((player) => player.isAlive);

		// 1v1 may need to be specially dealt with by the stalemate detector
		if (alivePlayers.length === 2 && alivePlayers.filter((player) => STALEMATE_PRIORITY_ORDER.includes(player.role.name)).length === 2) {
			const [priorityOne, priorityTwo] = alivePlayers.map((player) => STALEMATE_PRIORITY_ORDER.indexOf(player.role.name));
			if (priorityOne > priorityTwo) winningFaction = alivePlayers[0].role.faction;
			else if (priorityTwo > priorityOne) winningFaction = alivePlayers[1].role.faction;
		}

		for (const player of this.players) {
			if (player.role.faction.independent && player.role.faction.hasWonIndependent(player)) {
				independentWins.push(player);
			} else if (!player.role.faction.independent && player.role.faction.hasWon(this)) {
				winningFaction = player.role.faction;
			}
		}

		// if there are no major factions left end game immediately
		const majorFactions = this.players.filter((player) => player.isAlive && !player.role.faction.independent);
		if (majorFactions.length === 0) {
			return {
				ended: true,
				winningFaction: undefined,
				independentWins
			};
		}

		// draw by wipeout
		if (alivePlayers.length === 0) {
			return {
				ended: true,
				winningFaction: undefined,
				independentWins
			};
		}

		return {
			ended: winningFaction !== undefined,
			winningFaction,
			independentWins
		};
	}

	public async end(data: EndgameCheckData) {
		await this.channel.send(
			[
				data.winningFaction === undefined ? 'The game is over. Nobody wins!' : `The game is over. ${data.winningFaction.name} wins! 🎉`,
				data.independentWins.length === 0
					? null
					: `Independent wins: ${listItems(data.independentWins.map((player) => `${player.user.username} (${player.role.faction.name})`))}`
			]
				.filter((text) => text !== null)
				.join('\n')
		);

		const playerMapping = (player: Player, i: number) => {
			const roleText =
				player.previousRoles.length === 0 ? player.role.name : [...player.previousRoles, player.role].map((role) => role.name).join(' -> ');
			return `${i + 1}. ${player} (${roleText})`;
		};
		await this.channel.send(['**Final Rolelist**:', codeBlock('', this.players.map(playerMapping).join('\n'))].join('\n'));

		if (PGSQL_ENABLED) {
			const entity = new GameEntity();
			entity.setupName = this.setup!.name;
			entity.winningFaction = data.winningFaction?.name;
			entity.independentWins = data.independentWins.map((player) => player.role.name);
			entity.guildID = this.channel.guild.id;
			await getRepository(GameEntity).save(entity);

			await getConnection()
				.createQueryBuilder()
				.insert()
				.into(PlayerEntity)
				.values(
					this.players.map((player) => ({
						userID: player.user.id,
						faction: player.role.faction.name,
						roleName: player.role.name,
						result: data.winningFaction?.name === player.role.faction.name || data.independentWins.includes(player)
					}))
				)
				.execute();
		}

		await this.delete();
	}

	public async delete() {
		// free all permission overwrites
		// deleted channels can't have modifiable overwrites
		if (this.canOverwritePermissions && this.hasStarted && !this.channel.deleted) {
			for (const userID of this.permissionOverwrites) {
				const overwrite = this.channel.permissionOverwrites.find((permission) => permission.type === 'member' && permission.id === userID);
				if (overwrite) await overwrite.delete();
			}
		}

		if (ENABLE_PRIVATE_CHANNELS && this.hasStarted) {
			for (const player of this.players) {
				if (player.role.faction.informed && this.factionalChannels.has(player.role.faction.name)) {
					const channelServer = this.client.guilds.cache.get(PRIVATE_CHANNEL_SERVER)!;
					if (channelServer.members.cache.has(player.user.id)) {
						const member = channelServer.members.cache.get(player.user.id)!;
						await member.kick().catch(() => null);
					}
				}
			}
		}

		// reset numbered nicknames
		if (this.settings.numberedNicknames && this.channel.guild!.me?.hasPermission('MANAGE_NICKNAMES')) {
			for (const member of this.numberedNicknames) {
				// only reset a nickname if it's in the correct form
				if (member.nickname && /\[\d+\] (.+)/.test(member.nickname)) {
					const [, previousNickname] = /\[\d+\] (.+)/.exec(member.nickname)!;
					if (this.channel.guild!.me && canManage(this.channel.guild!.me, member))
						await member.setNickname(previousNickname).catch(() => null);
				}
			}
		}

		// reset adaptive slowmode
		if (this.settings.adaptiveSlowmode && this.channel.permissionsFor(this.client.user!)!.has('MANAGE_CHANNELS') && !this.channel.deleted)
			await this.channel.setRateLimitPerUser(0);

		for (const [factionalChannel] of this.factionalChannels.values()) {
			if (factionalChannel.deleted) continue;
			for (const [, invite] of await factionalChannel.fetchInvites()) {
				if (invite.deletable) await invite.delete();
			}
			if (factionalChannel.deletable) await factionalChannel.delete();
		}

		this.client.games.delete(this.channel.id);
	}

	public get canOverwritePermissions() {
		return this.settings.overwritePermissions && this.channel.permissionsFor(this.client.user!)?.has(['MANAGE_CHANNELS', 'MANAGE_ROLES']);
	}

	public remaining(showIn = false) {
		const remaining = this.phaseEndAt!.getTime() - Date.now();
		if (remaining <= 0) return 'any time soon...';
		return showIn ? `in ${format(remaining)}` : format(remaining);
	}

	public async updateAdaptiveSlowmode() {
		const alivePlayers = this.players.filter((player) => player.isAlive).length;
		if (alivePlayers >= 12) await this.channel.setRateLimitPerUser(5);
		else if (alivePlayers >= 6) await this.channel.setRateLimitPerUser(3);
		else await this.channel.setRateLimitPerUser(0);
	}

	public async mute(player: Player) {
		await this.channel.updateOverwrite(player.user, {
			SEND_MESSAGES: false,
			ADD_REACTIONS: false
		});
		this.permissionOverwrites.push(player.user.id);
	}

	public async releaseMute(player: Player) {
		// calls to splice() with invalid indexes have unexpected behavior
		const index = this.permissionOverwrites.indexOf(player.user.id);
		if (index === -1) return;
		await this.channel
			.updateOverwrite(player.user, {
				SEND_MESSAGES: null,
				ADD_REACTIONS: null
			})
			.catch(() => null);
		this.permissionOverwrites.splice(index, 1);
	}

	public toJSON() {
		return {
			cycle: this.cycle,
			phase: this.phase,
			players: this.players.map((player) => player.toJSON()),
			votes: this.votes,
			setup: {
				name: this.setup?.name,
				roles: this.setup?.roles
			},
			permissionOverwrites: this.permissionOverwrites,
			createdAt: this.createdAt,
			nightActions: this.nightActions.map((action) => action)
		};
	}
}

export interface GameSettings {
	dayDuration: number;
	nightDuration: number;
	overwritePermissions: boolean;
	maxPlayers: number;
	disableWhispers: boolean;
	numberedNicknames: boolean;
	muteAtNight: boolean;
	adaptiveSlowmode: boolean;
	disableWills: boolean;
	enableTrials: boolean;
	enablePlurality: boolean;
	maxTrials: number;
}

export interface EndgameCheckData {
	ended: boolean;
	winningFaction: Faction | undefined;
	independentWins: Player[];
}
