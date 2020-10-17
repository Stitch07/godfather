import Townie from "@root/lib/mafia/mixins/Townie";
import Cop from "../Cop";

// @ts-ignore
class Paranoid_Cop extends Cop {

	public name = 'Paranoid Cop';

	get displayName() {
		return 'Cop';
	}

	innocenceModifer(innocence: boolean) {
		return false;
	}

}

export default Townie(Paranoid_Cop);