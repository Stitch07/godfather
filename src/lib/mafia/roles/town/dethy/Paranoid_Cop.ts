import Townie from '@mafia/mixins/Townie';
import Cop from '../Cop';

// @ts-ignore weird error
class Paranoid_Cop extends Cop {

	public name = 'Paranoid Cop';

	private _display = 'Cop';
	public get display() {
		return this._display;
	}

	public innocenceModifer() {
		return false;
	}

}

export default Townie(Paranoid_Cop);
