import Player from '@mafia/Player';
import DefaultMap from '@util/DefaultMap';
import Game from '@mafia/Game';
import ActionRole from '@mafia/mixins/ActionRole';

export default class NightActionsManager extends Array<NightAction> {

	public record = new NightRecord();
	public framedPlayers: Player[] = [];
	public constructor(public game: Game) {
		super();
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
			if (actor !== target && flags.canVisit) {
				// visit player here
			}
		}
		for (const { action, actor, target } of this) {
			if (action === undefined) continue;
			await (actor.role! as ActionRole).tearDown(this, target);
		}

		const deadPlayers = [];
		for (const [playerID, record] of this.record.entries()) {
			if (record.get('nightkill').result) {
				const deadPlayer = this.game.players.find(player => player.user.id === playerID);
				deadPlayers.push(deadPlayer!);
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
		super(new DefaultMap(DEFAULT_NIGHT_ENTRY));
	}

}

export interface NightAction {
	action: NightActionCommand;
	actor: Player;
	priority: NightActionPriority;
	target?: Player;
	flags: {
		canBlock: boolean;
		canTransport: boolean;
		canVisit: boolean;
	};
}

export interface NightRecordEntry {
	result: boolean;
	by: Player[];
}

export enum NightActionCommand {
	SHOOT = 'shoot'
}

export enum NightActionPriority {
	// special cases that can never be transported/blocked/healed
	VETERAN = 0,
	JESTER_HAUNT = 0,
	VIGI_SUICIDE = 0,
	SURVIVOR = 0,
	// modify night actions directly
	ESCORT = 1,
	TRANSPORTER = 1,
	SHOOTER = 2,  // godfather/goon/vigilante
	SERIAL_KILLER = 2,
	// healers always act after shooters
	DOCTOR = 3,
	BODYGUARD = 3,
	// these roles deal Powerful attacks that cannot be healed
	ARSONIST = 4,
	// investigative roles usually only rely on tearDown, so they can safely go last
	COP = 5,
	LOOKOUT = 5,
	CONSIG = 5,
	TRACKER = 5,
	FRAMER = 5,
	// janitor cleans after killing roles have already killed them
	JANITOR = 6,
}
