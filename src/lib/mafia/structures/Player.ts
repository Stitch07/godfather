import Role from './Role';
import Game from './Game';
import { User } from 'discord.js';
import { ENABLE_PRIVATE_CHANNELS } from '@root/config';
import { cast } from '../../util/utils';

export default class Player {

	public isAlive = true;
	// whether this player was cleaned by a janitor
	public cleaned = false;
	public deathReason = '';
	public previousRoles = [] as Role[];
	public visitors: Player[] = [];
	public flags = {
		isRevived: false,
		revivedOn: cast<number | null>(null)
	};

	public will = '';

	private _role!: Role;
	private messageQueue: string[] = [];
	public constructor(public user: User, public game: Game) {
	}

	public async sendPM(sendTeamInfo = true) {
		const rolePM = [
			`Hello ${this.user.tag}, you are a **${this.role.display}**. ${this.role.description}`,
			`Win Condition: ${this.role!.faction.winCondition}`
		].join('\n');
		await this.user.send(rolePM);

		if (this.role.faction.informed && sendTeamInfo) {
			const team = this.game.players.filter(player => player.role.faction.name === this.role.faction.name);
			if (team.length > 1) {
				const factionalChannel = ENABLE_PRIVATE_CHANNELS ? await this.role.faction.generateInvite(this.game) : null;
				await this.user.send(`Your team consists of: ${team.map(player => `${player.user.tag} (${player.role.name})`).join(', ')}\n${factionalChannel ? `Factional channel: ${factionalChannel}` : ''}`);
			}
		}
	}

	public toString(): string {
		return this.user.username;
	}

	public async kill(reason: string) {
		this.isAlive = false;
		this.deathReason = reason;

		// mute dead people
		if (this.game.canOverwritePermissions) {
			await this.game.mute(this);
		}

		await this.role!.onDeath();
	}

	public queueMessage(content: string) {
		this.messageQueue.push(content);
	}

	public async flushQueue() {
		if (this.messageQueue.length === 0) return;
		await this.user.send(this.messageQueue.join('\n'));
		this.messageQueue = [];
	}

	public async visit(visitor: Player) {
		this.visitors.push(visitor);
		await this.role.onVisit(visitor);
	}

	public displayRoleAndWill(night = false): string {
		const roleText = this.cleaned && night
			? 'We could not determine their role.'
			: `They were a **${this.role!.display}**.`;

		const willText = this.game.settings.disableWills
			? ''
			: this.will && !(this.cleaned && night)
				? ` They left a will:\n\`\`\`${this.will}\`\`\`\n`
				: ' We could not find a will.';

		return `${roleText}${willText}`;
	}

	public toJSON(): Record<string, unknown> {
		return {
			user: this.user.toJSON(),
			role: this.role
				? {
					name: this.role.name,
					modifiers: this.role.modifiers
				}
				: null,
			previousRoles: this.previousRoles.map(role => ({ name: role.name, modifiers: role.modifiers })),
			isAlive: this.isAlive,
			cleaned: this.cleaned,
			flags: this.flags,
			deathReason: this.deathReason,
			will: this.will,
			messageQueue: this.messageQueue,
			visitors: this.visitors.map(visitor => visitor.toJSON())
		};
	}

	public static resolve(game: Game, arg: string) {
		if (Number.isInteger(parseInt(arg, 10)) && Number(arg) <= game.players.length && Number(arg) >= 1) {
			return game.players[Number(arg) - 1];
		}
		return null;
	}

	public get role() {
		return this._role;
	}

	public set role(role: Role) {
		if (this._role) this.previousRoles.push(this._role);
		this._role = role;
	}

}
