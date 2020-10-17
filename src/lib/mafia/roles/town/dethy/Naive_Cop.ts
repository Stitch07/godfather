import Townie from "@root/lib/mafia/mixins/Townie";
import Cop from "../Cop";

// @ts-ignore
class Naive_Cop extends Cop {

	public name = 'Naive Cop';

	get displayName() {
		return 'Cop';
	}

	innocenceModifer(innocence: boolean) {
		return true;
	}

}

export default Townie(Naive_Cop);