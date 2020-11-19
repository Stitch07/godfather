import Role from './Role';
import Game from './Game';
import { User } from 'discord.js';
import { ENABLE_PRIVATE_CHANNELS } from '@root/config';

export default class Player {

	public isAlive = true;
	// whether this player was cleaned by a janitor
	public cleaned = false;
	public deathReason = '';
	public previousRoles = [] as Role[];
	public visitors: Player[] = [];
	private _role!: Role;
	public constructor(public user: User, public game: Game) {
	}

	public async sendPM() {
		const rolePM = [
			`Hello ${this.user.tag}, you are a **${this.role.display}**. ${this.role.description}`,
			`Win Condition: ${this.role!.faction.winCondition}`
		].join('\n');
		await this.user.send(rolePM);

		if (this.role.faction.informed) {
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
			await this.game.channel.updateOverwrite(this.user, {
				SEND_MESSAGES: false,
				ADD_REACTIONS: false
			});
			this.game.permissionOverwrites.push(this.user.id);
		}

		await this.role!.onDeath();
	}

	public async visit(visitor: Player) {
		this.visitors.push(visitor);
		await this.role.onVisit(visitor);
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
		if (this.role) this.previousRoles.push(this.role);
		this._role = role;
	}

}
