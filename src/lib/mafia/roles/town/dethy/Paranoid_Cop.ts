import DethyCop from '@mafia/mixins/DethyCop';
import Cop from '../Cop';

// @ts-ignore weird error
class Paranoid_Cop extends Cop {

	public name = 'Paranoid Cop';

	public innocenceModifer() {
		return false;
	}

}

export default DethyCop(Paranoid_Cop);
