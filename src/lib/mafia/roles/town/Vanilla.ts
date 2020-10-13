import Townie from '@mafia/mixins/Townie';
import Role from '../../Role';

class Vanilla extends Role {

	public name = 'Vanilla';

	public description = 'You have no night actions. Your vote is your only power.';

	public static documentation = 'Roleinfo docs here.';

}

export default Townie(Vanilla);
