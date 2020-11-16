import Player from '@mafia/Player';
import { Awaited } from '@sapphire/framework';
import { Message } from 'discord.js';
import Faction from './Faction';
import { Defense } from './managers/NightActionsManager';

const INNOCENT_FACTIONS = ['Town', 'Survivor', 'Jester'];

export interface CanUseActionData {
	check: boolean;
	reason?: string;
}

abstract class Role {

	public name = '';
	public description = '';
	public unique = false;
	public constructor(public player: Player) {
	}

	public get display(): string {
		if (this.player.cleaned) return 'Cleaned';
		return this.name;
	}

	// just for easier accessibility
	public get game() {
		return this.player.game;
	}

	public get innocence() {
		return INNOCENT_FACTIONS.includes(this.faction.name);
	}

	public get defense() {
		return Defense.None;
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get voteWeight() {
		return 1;
	}

	public onDeath() {
		// noop
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

	public canUseAction(): CanUseActionData {
		return { check: false, reason: '' };
	}

	// Role categories such as Random Town, Neutral Evil
	public static categories: string[] = ['Any'];

	public static aliases: string[] = [];

}

interface Role {
	onPmCommand(message: Message, command: string, ...args: string[]): void;
	onNight(): Awaited<any>;
	onDay(): Awaited<any>;
	onDeath(): Awaited<any>;
	onVisit(visitor: Player): Awaited<any>;
	faction: Faction;
}

export default Role;
