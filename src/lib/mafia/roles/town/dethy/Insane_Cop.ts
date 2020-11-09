import Townie from '@mafia/mixins/Townie';
import Cop from '../Cop';

// @ts-ignore weird error
class Insane_Cop extends Cop {

	public name = 'Insane Cop';

	public innocenceModifier(innocence: boolean) {
		return !innocence;
	}

}

export default Townie(Insane_Cop);
