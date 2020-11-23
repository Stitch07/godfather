import Townie from '@mafia/mixins/Townie';
import Role from '@mafia/Role';

class Vanilla extends Role {

	public name = 'Vanilla';

	public description = 'You have no night actions. Your vote is your only power.';

}

export default Townie(Vanilla);
