import DethyCop from '@mafia/mixins/DethyCop';
import Cop from '../Cop';

// @ts-ignore weird error
class Insane_Cop extends Cop {

	public name = 'Insane Cop';

	public innocenceModifier(innocence: boolean) {
		return !innocence;
	}

}

export default DethyCop(Insane_Cop);
