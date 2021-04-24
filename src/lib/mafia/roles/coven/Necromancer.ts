import CovenRole from '@mafia/mixins/CovenRole';
import type Player from '@mafia/structures/Player';
import { Phase } from '@mafia/structures/Game';
import Reanimator from '../town/Reanimator';

const INVALID_ROLES = ['Transporter', 'Reanimator', 'Veteran', 'Necromancer'];

// @ts-ignore tsc bug
class Necromancer extends Reanimator {
	public name = 'Necromancer';

	public canTarget([player]: Player[]) {
		if (player.isAlive) return { check: false, reason: this.game.t('roles/town:reanimatorDeadOnly') };
		if (!Reflect.has(player.role, 'action') || Reflect.get(player.role, 'actionPhase') !== Phase.Night)
			return { check: false, reason: this.game.t('roles/town:reanimatorActionOnly') };
		if (INVALID_ROLES.includes(player.role.name))
			return { check: false, reason: this.game.t('roles/town:reanimatorInvalidRole', { role: player.role.name }) };
		return { check: true, reason: '' };
	}
}

Necromancer.aliases = ['Necro'];

export default CovenRole(Necromancer);
