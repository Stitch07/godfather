import Role from './Role';
import Game from './Game';
import { User } from 'discord.js';

export default class Player {

	public isAlive = true;
	// whether this player was cleaned by a janitor
	public cleaned = false;
	public deathReason = '';
	public previousRoles = [] as Role[];
	public role?: Role;
	public constructor(public user: User, public game: Game) {
	}

	public async sendPM() {
		const rolePM = [
			`Hello ${this.user.tag}, you are a **${this.role!.display}**. ${this.role!.description}`,
			`Win Condition: ${this.role!.faction.winCondition}`
		].join('\n');
		await this.user.send(rolePM);

		if (this.role!.faction.informed) {
			const team = this.game.players.filter(player => player.role!.faction.name === this.role!.faction.name);
			if (team.length > 1) {
				await this.user.send(`Your team consists of: ${team.map(player => player.user).join(', ')}`);
			}
		}
	}

	public toString(): string {
		return this.user.username;
	}

	public async kill(reason: string) {
		this.isAlive = false;
		this.deathReason = reason;

		await this.role!.onDeath();
	}

	public static resolve(game: Game, arg: string) {
		if (Number.isInteger(parseInt(arg, 10)) && Number(arg) <= game.players.length && Number(arg) >= 1) {
			return game.players[Number(arg) - 1];
		}
		return null;
	}

}
