import DethyCop from '@mafia/mixins/DethyCop';
import Cop from '../Cop';

// @ts-ignore weird error
class Naive_Cop extends Cop {

	public name = 'Naive Cop';

	public innocenceModifer() {
		return true;
	}

}

export default DethyCop(Naive_Cop);
