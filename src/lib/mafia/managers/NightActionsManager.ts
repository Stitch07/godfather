import Game, { Phase } from '@mafia/structures/Game';
import type Player from '@mafia/structures/Player';
import { DEFAULT_ACTION_FLAGS } from '@root/lib/constants';
import { fauxAlive, listItems } from '@root/lib/util/utils';
import { mergeDefault } from '@sapphire/utilities';
import DefaultMap from '@util/DefaultMap';
import { ActionRole } from '../structures/ActionRole';
import type { NightAction, OneOrMultiplePlayers } from './NightAction';

export default class NightActionsManager extends Array<NightActionEntry> {
	public record = new NightRecord();
	public framedPlayers: Player[] = [];
	public protectedPlayers: Player[] = [];
	public hexedPlayers: Player[] = [];
	public constructor(public game: Game) {
		super();
	}

	public async addAction(action: NightActionEntry) {
		const possibleActions = this.game.players.filter(
			(player) =>
				fauxAlive(player) && (player.role as ActionRole).canUseAction().check && Reflect.get(player.role, 'actionPhase') === Phase.Night
		);
		if (action.actor.role.name === 'Reanimator' && action.target) {
			const { priority } = ((action.target as Player).role as ActionRole).actions[0];
			action.priority = priority;
		}

		action.flags = mergeDefault(DEFAULT_ACTION_FLAGS, action.flags ?? {});
		if (action.actor === action.target) action.flags!.canTransport = false;
		this.push(action);

		if (action.actor.role.faction.informed && this.game.factionalChannels.has(action.actor.role.faction.name)) {
			const [factionalChannel] = this.game.factionalChannels.get(action.actor.role.faction.name)!;
			const target = action.target ? (Array.isArray(action.target) ? action.target : [action.target]) : null;
			await factionalChannel.send(
				`**${action.actor.user.tag}** is ${action.action.actionGerund} ${target ? listItems(target.map((pl) => pl.user.tag)) : ''}`
			);
		}
		if (this.length >= possibleActions.length && this.game.phase === Phase.Night && !this.game.phaseChangeMutex.isLocked())
			await this.game.phaseChangeMutex.runExclusive(() => this.game.startDay());
	}

	public async resolve(): Promise<Player[]> {
		const possibleActions = this.game.players.filter(
			(player) =>
				fauxAlive(player) && (player.role as ActionRole).canUseAction().check && Reflect.get(player.role, 'actionPhase') === Phase.Night
		);
		// add any default actions the player has
		const noActionsSent = possibleActions.filter(
			(player) => Reflect.has(player.role, 'action') && !this.find((action) => action.actor === player)
		);
		for (const player of noActionsSent) {
			const { defaultAction } = player.role as ActionRole;
			if (defaultAction) this.push(defaultAction);
		}

		// sort by ascending priorities
		this.sort((a, b) => a.priority - b.priority);
		// run setUp, runAction and tearDown
		for (const { action, target } of this) {
			await action.setUp(this, target);
		}
		for (let { action, actor, target, flags } of this) {
			if (!flags) flags = DEFAULT_ACTION_FLAGS;
			if (action === undefined) continue;
			await action.runAction(this, target);
			action.numRemainingUses -= 1;
			if (flags.canVisit) {
				const targets = Array.isArray(target) ? (actor.role.name === 'Witch' ? [target[0]] : target) : [target];
				for (const target of targets) {
					if (target?.user.id !== actor.user.id) await target?.visit(actor);
				}
			}
		}
		for (const { action, target } of this) {
			if (action === undefined) continue;
			await action.tearDown(this, target);
		}

		for (const player of this.game.players) {
			await player.role.afterActions();
			if (player.role instanceof ActionRole) {
				(player.role as ActionRole).actions = (player.role as ActionRole).actions.filter((action) => action.numRemainingUses !== 0);
			}
		}

		const deadPlayers = [];
		for (const [playerID, record] of this.record.entries()) {
			if (record.has('nightkill') && record.get('nightkill').result) {
				const deadPlayer = this.game.players.find((player) => player.user.id === playerID);
				if (deadPlayer) {
					await deadPlayer.kill(`killed N${this.game.cycle}`);
					deadPlayer.queueMessage('You have died!');
					deadPlayers.push(deadPlayer!);
				}
			}
		}

		// flush all message queues
		for (const player of this.game.players) {
			await player.flushQueue();
		}

		return deadPlayers;
	}

	public reset() {
		this.record = new NightRecord();
		this.length = 0; // dumb way of clearing an array but it's necessary
	}
}

export class NightRecord extends DefaultMap<string, DefaultMap<string, NightRecordEntry>> {
	public constructor() {
		super(() => new DefaultMap(() => ({ result: false, by: [] })));
	}

	public setAction(targetID: string, recordEntry: string, item: NightRecordEntry) {
		const record = this.get(targetID);
		const entry = record.get(recordEntry);
		entry.result = item.result;
		if (item.type) entry.type = item.type;
		for (const player of item.by) entry.by.push(player);
		// set all values back in
		record.set(recordEntry, entry);
		this.set(targetID, record);
	}
}

export interface NightActionEntry {
	action: NightAction;
	actor: Player;
	priority: NightActionPriority;
	target?: OneOrMultiplePlayers;
	flags?: {
		canBlock?: boolean;
		canTransport?: boolean;
		canVisit?: boolean;
		canWitch?: boolean;
	};
}

export interface NightRecordEntry {
	result: boolean;
	by: Player[];
	type?: Attack;
}

export const enum Attack {
	Basic = 1,
	Powerful,
	Unstoppable
}

export const enum Defence {
	None = 1,
	Basic,
	Powerful,
	Invincible
}

export enum NightActionPriority {
	// special cases that can never be transported/blocked/healed
	VETERAN = 0,
	JESTER_HAUNT = 0,
	VIGI_SUICIDE = 0,
	Vest = 0,
	Witch = 0,
	Reanimator = 0,
	// modify night actions directly
	ESCORT = 1,
	TRANSPORTER = 1,
	KILLER = 2, // godfather/goon/vigilante
	SERIAL_KILLER = 2,
	// healers always act after shooters
	Healer = 3,
	BODYGUARD = 3,
	JAILKEEPER = 3,
	// these roles deal Powerful attacks that cannot be healed
	ARSONIST = 4,
	// roles that affect investigative results or stop powerful attacks
	CRUSADER = 5,
	GUARDIAN_ANGEL = 5,
	FRAMER = 5,
	// investigative roles usually only rely on tearDown, so they can safely go last
	COP = 6,
	LOOKOUT = 6,
	INVEST = 6,
	CONSIG = 6,
	TRACKER = 6,
	NEOPOLITAN = 6,
	AMBUSHER = 6,
	// janitor cleans after killing roles have already killed them
	JANITOR = 7,
	// ret's position literally doesn't matter
	RETRIBUTIONIST = 8,
	AMNESIAC = 9,
	// CL should ALWAYS be last
	CultLeader = 10
}
