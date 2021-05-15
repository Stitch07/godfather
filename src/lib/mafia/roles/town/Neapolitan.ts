import SingleTarget from '@mafia/mixins/SingleTarget';
import type Player from '@mafia/structures/Player';
import { NeapolitanAction } from '../../actions/common/NeapolitanAction';
import type { NightAction } from '../../managers/NightAction';

export default class Neapolitan extends SingleTarget {
	public name = 'Neapolitan';
	public actions: NightAction[] = [new NeapolitanAction(this)];

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/town:neapolitanDescription');
	}
}
