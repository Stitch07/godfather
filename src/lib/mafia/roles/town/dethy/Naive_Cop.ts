import Townie from '@mafia/mixins/Townie';
import Cop from '../Cop';

// @ts-ignore weird error
class Naive_Cop extends Cop {

	public name = 'Naive Cop';

	public innocenceModifer() {
		return true;
	}

}

export default Townie(Naive_Cop);
