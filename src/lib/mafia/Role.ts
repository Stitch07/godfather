import Player from '@mafia/Player';
import { Message } from 'discord.js';
import Faction from './Faction';

const INNOCENT_FACTIONS = ['Town'];

export interface CanUseActionData {
	check: boolean;
	reason?: string;
}

abstract class Role {

	public name = '';
	public description = '';
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

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public get voteWeight() {
		return 1;
	}

	public async onDeath() {
		// noop
	}

	public async onNight() {
		// noop
	}

	public async onDay() {
		// noop
	}

	public canUseAction(): CanUseActionData {
		return { check: false, reason: '' };
	}

	// Role categories such as Random Town, Neutral Evil
	public static categories: string[] = ['Any'];

	// Docs used in roleinfo command
	public static documentation = '';

}

interface Role {
	onPmCommand(message: Message, command: string, ...args: string[]): void;
	onNight(): Promise<void>;
	onDay(): Promise<void>;
	onDeath(): Promise<void>;
	faction: Faction;
}

export default Role;
