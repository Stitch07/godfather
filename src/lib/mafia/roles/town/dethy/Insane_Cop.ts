import Cop from '../Cop';

// @ts-ignore weird error
class Insane_Cop extends Cop {
	public name = 'Insane Cop';

	public innocenceModifier(innocence: boolean) {
		return !innocence;
	}
}

Insane_Cop.categories = ['Dethy Cop'];

export default Insane_Cop;
