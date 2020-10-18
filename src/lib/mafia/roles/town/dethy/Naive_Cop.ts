import Townie from "@mafia/mixins/Townie";
import Cop from "../Cop";

// @ts-ignore
class Naive_Cop extends Cop {

	public name = 'Naive Cop';

	get display() {
		return 'Cop';
	}

	public innocenceModifer(innocence: boolean) {
		return true;
	}

}

export default Townie(Naive_Cop);