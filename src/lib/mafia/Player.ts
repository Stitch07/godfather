import { KlasaUser } from 'klasa';
import Role from './Role';
import Game from './Game';

export default class Player {

	public isAlive = true;
	public deathReason = '';
	public role?: Role;
	public constructor(public user: KlasaUser, public game: Game) {

	}

	public toString(): string {
		return this.user.username;
	}

	public kill(reason: string) {
		this.isAlive = false;
		this.deathReason = reason;
	}

}
