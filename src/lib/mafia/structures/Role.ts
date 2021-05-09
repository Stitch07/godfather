import type Player from '@mafia/structures/Player';
import type { Awaited } from '@sapphire/framework';
import { Attack, Defence } from '../managers/NightActionsManager';
import { allRoles } from '../roles';
import type Executioner from '../roles/neutral/Executioner';
import type Faction from './Faction';

const INNOCENT_FACTIONS = ['Town', 'Survivor', 'Jester', 'Amnesiac', 'Guardian Angel', 'Juggernaut', 'Godfather', 'Executioner'];

abstract class Role {
	public name = '';
	public description = '';
	public modifiers: RoleModifiers = {
		voteWeight: 1,
		innocence: null,
		defence: null,
		attack: null
	};

	public constructor(public player: Player) {}

	public get display(): string {
		if (this.player.cleaned && !this.player.isAlive) return 'Cleaned';
		return this.name;
	}

	// just for easier accessibility
	public get game() {
		return this.player.game;
	}

	public get innocence() {
		return INNOCENT_FACTIONS.includes(this.faction.name);
	}

	public get defence() {
		return Defence.None;
	}

	public get actualDefence() {
		return this.modifiers.defence ?? this.defence;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get voteWeight() {
		return this.modifiers.voteWeight;
	}

	public init() {
		// noop
	}

	public async onDeath() {
		if (this.faction.name !== 'Town' || this.player.deathReason.includes('eliminated')) return;

		const executionersInGame = this.game.players.filter((player) => player.isAlive && player.role.name === 'Executioner');
		for (const executioner of executionersInGame) {
			if (this.player.user.id === (executioner.role as Executioner).target.user.id) {
				await executioner.user.send(this.game.t('roles/neutral:executionerTargetNKed'));
				const Jester = allRoles.get('Jester')!;
				executioner.role = new Jester(executioner);
				await executioner.sendPM();
			}
		}
	}

	public onNight() {
		// noop
	}

	public onDay() {
		// noop
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public onVisit(visitor: Player) {
		// noop
	}

	public afterActions() {
		// noop
	}

	// Role categories such as Random Town, Neutral Evil
	public static categories: string[] = [];

	public static aliases: string[] = [];

	public static unique = false;
}

interface Role {
	onNight(): Awaited<any>;
	onDay(): Awaited<any>;
	onDeath(): Awaited<any>;
	onVisit(visitor: Player): Awaited<any>;
	faction: Faction;
}

export interface RoleModifiers {
	voteWeight: number;
	innocence: boolean | null;
	defence: Defence | null;
	attack: Attack | null;
}

export default Role;
