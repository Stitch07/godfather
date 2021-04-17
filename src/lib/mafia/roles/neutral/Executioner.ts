import ExecutionerFaction from '@mafia/factions/neutral/Executioner';
import { allRoles } from '@mafia/roles';
import type Player from '@mafia/structures/Player';
import Role from '@mafia/structures/Role';
import { randomArrayItem } from '@util/utils';
import { Defence } from '../../managers/NightActionsManager';

class Executioner extends Role {
	public name = 'Executioner';
	public target!: Player;
	public faction = new ExecutionerFaction();

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:executionerDescription');
	}

	public async init() {
		const targets = this.game.players.filter((player) => player.role.faction.name === 'Town' && player.role.name !== 'Mayor');
		if (targets.length === 0) {
			await this.player.user.send(this.game.t('roles/neutral:executionerNoTargets'));
			const Jester = allRoles.get('Jester')!;
			this.player.role = new Jester(this.player);
			return this.player.sendPM();
		}

		this.target = randomArrayItem(targets)!;
		return this.player.user.send(this.game.t('roles/neutral:executionerMessage', { target: this.target.user.tag }));
	}

	public get defence() {
		return Defence.Basic;
	}
}

Executioner.aliases = ['Exe'];
Executioner.categories = [...Executioner.categories, 'Random Neutral', 'Neutral Evil', 'Evil'];

export default Executioner;
