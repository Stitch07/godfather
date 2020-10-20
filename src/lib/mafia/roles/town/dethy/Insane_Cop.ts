import Townie from '@mafia/mixins/Townie';
import Cop from '../Cop';

// @ts-ignore weird error
class Insane_Cop extends Cop {

	public name = 'Insane Cop';

	private readonly _display = 'Cop';
	public get display() {
		return this._display;
	}

	public innocenceModifier(innocence: boolean) {
		return !innocence;
	}

}

export default Townie(Insane_Cop);
