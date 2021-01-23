import MafiaRole from '@mafia/mixins/MafiaRole';
import Escort from '@mafia/roles/town/Escort';

// @ts-ignore tsc bug
class Consort extends Escort {
  public name = 'Consort';
}

Consort.categories = ['Mafia Support'];

export default MafiaRole(Consort);
