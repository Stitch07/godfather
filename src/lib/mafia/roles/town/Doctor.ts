import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';
import { ActionRole } from '../../structures/ActionRole';
import type { NightAction } from '../../managers/NightAction';
import { DoctorHealAction } from '../../actions/common/HealAction';

class Doctor extends ActionRole {
	public name = 'Doctor';
	public actions: NightAction[] = [new DoctorHealAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:doctorDescription');
	}

	public get extraNightContext() {
		return (this.actions.find((action) => action.name === 'heal') as DoctorHealAction).hasSelfHealed
			? this.game.t('roles/town:doctorCannotSelfHeal')
			: this.game.t('roles/town:doctorCanSelfHeal');
	}
}

Doctor.aliases = ['Doc'];
Doctor.categories = [...Doctor.categories, 'Town Protective'];

export default Townie(Doctor);
