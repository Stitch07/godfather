import Townie from '@mafia/mixins/Townie';
import Cop from '../Cop';

// @ts-ignore werid error
class Naive_Cop extends Cop {

	public name = 'Naive Cop';

	private readonly _display = 'Cop';
	public get display() {
		return this._display;
	}

	public innocenceModifer() {
		return true;
	}

}

export default Townie(Naive_Cop);
