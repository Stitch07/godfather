import Townie from "@mafia/mixins/Townie";
import Cop from "../Cop";

// @ts-ignore
class Paranoid_Cop extends Cop {

	public name = 'Paranoid Cop';

	get display() {
		return 'Cop';
	}

	public innocenceModifer(innocence: boolean) {
		return false;
	}

}

export default Townie(Paranoid_Cop);