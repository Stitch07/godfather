import Cop from '../Cop';

// @ts-ignore weird error
class Paranoid_Cop extends Cop {
  public name = 'Paranoid Cop';

  public innocenceModifier() {
    return false;
  }
}

Paranoid_Cop.categories = ['Dethy Cop'];

export default Paranoid_Cop;
