import Escort from '@mafia/roles/town/Escort';
import MafiaRole from '@mafia/mixins/MafiaRole';

// @ts-ignore tsc bug
class Consort extends Escort {

	public name = 'Consort';

}

export default MafiaRole(Consort);
