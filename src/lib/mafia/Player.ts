import { KlasaUser } from 'klasa';
import Role from './Role';

export default class Player {

	public isAlive = true;
	public deathReason = '';
	public role?: Role;
	public constructor(public user: KlasaUser) {

	}

}
