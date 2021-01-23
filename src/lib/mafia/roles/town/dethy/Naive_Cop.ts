import Cop from '../Cop';

// @ts-ignore weird error
class Naive_Cop extends Cop {
  public name = 'Naive Cop';

  public innocenceModifier() {
    return true;
  }
}

Naive_Cop.categories = ['Dethy Cop'];

export default Naive_Cop;
