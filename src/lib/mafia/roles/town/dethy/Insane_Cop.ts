import Townie from "@mafia/mixins/Townie";
import Cop from "../Cop";

// @ts-ignore
class Insane_Cop extends Cop {

	public name = 'Insane Cop';

	get display() {
		return 'Cop';
	}

	public innocenceModifier(innocence: boolean) {
		return !innocence;
	}
}

export default Townie(Insane_Cop);