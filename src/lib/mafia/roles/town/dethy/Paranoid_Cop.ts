import Townie from '@mafia/mixins/Townie';
import Cop from '../Cop';

// @ts-ignore weird error
class Paranoid_Cop extends Cop {

	public name = 'Paranoid Cop';

	public innocenceModifer() {
		return false;
	}

}

export default Townie(Paranoid_Cop);
