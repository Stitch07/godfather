import Player from '@mafia/Player';
import DefaultMap from '@util/DefaultMap';
import Game, { Phase } from '@mafia/Game';
import ActionRole from '@mafia/mixins/ActionRole';

export default class NightActionsManager extends Array<NightAction> {

	public record = new NightRecord();
	public framedPlayers: Player[] = [];
	public constructor(public game: Game) {
		super();
	}

	public async addAction(action: NightAction) {
		const possibleActions = this.game.players.filter(player => player.role.canUseAction().check && Reflect.get(player.role, 'actionPhase') === Phase.Night);
		this.push(action);
		if (this.length >= possibleActions.length) await this.game.startDay();
	}

	public async resolve(): Promise<Player[]> {
		// sort by ascending priorities
		this.sort((a, b) => a.priority - b.priority);
		// run setUp, runAction and tearDown
		for (const { action, actor, target } of this) {
			if (action === undefined) continue;
			await (actor.role! as ActionRole).setUp(this, target);
		}
		for (const { action, actor, target, flags } of this) {
			if (action === undefined) continue;
			await (actor.role! as ActionRole).runAction(this, target);
			if (actor !== target && (flags?.canVisit ?? true)) {
				const targets = Array.isArray(target) ? target : [target];
				for (const target of targets) {
					await target?.visit(actor);
				}
			}
		}
		for (const { action, actor, target } of this) {
			if (action === undefined) continue;
			await (actor.role! as ActionRole).tearDown(this, target);
		}

		const deadPlayers = [];
		for (const [playerID, record] of this.record.entries()) {
			if (record.has('nightkill') && record.get('nightkill').result) {
				const deadPlayer = this.game.players.find(player => player.user.id === playerID);
				if (deadPlayer) {
					deadPlayer.kill(`killed N${this.game.cycle}`);
					deadPlayers.push(deadPlayer!);
				}
			}
		}
		return deadPlayers;
	}

	public reset() {
		this.record.clear();
		this.length = 0; // dumb way of clearing an array but it's necessary
		this.framedPlayers.length = 0;
	}

}

const DEFAULT_NIGHT_ENTRY = {
	result: false,
	by: []
};

export class NightRecord extends DefaultMap<string, DefaultMap<string, NightRecordEntry>> {

	public constructor() {
		super(() => new DefaultMap(() => DEFAULT_NIGHT_ENTRY));
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

export interface NightAction {
	action: string | undefined;
	actor: Player;
	priority: NightActionPriority;
	target?: Player | Player[];
	flags?: {
		canBlock: boolean;
		canTransport: boolean;
		canVisit: boolean;
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

export const enum Defense {
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
	SURVIVOR = 0,
	Witch = 0,
	// modify night actions directly
	ESCORT = 1,
	TRANSPORTER = 1,
	KILLER = 2,  // godfather/goon/vigilante
	SERIAL_KILLER = 2,
	// healers always act after shooters
	DOCTOR = 3,
	BODYGUARD = 3,
	// these roles deal Powerful attacks that cannot be healed
	ARSONIST = 4,
	// roles that affect investigative results
	FRAMER = 5,
	// investigative roles usually only rely on tearDown, so they can safely go last
	COP = 6,
	LOOKOUT = 6,
	CONSIG = 6,
	TRACKER = 6,
	NEOPOLITAN = 6,
	AMBUSHER = 6,
	// janitor cleans after killing roles have already killed them
	JANITOR = 7,
}
