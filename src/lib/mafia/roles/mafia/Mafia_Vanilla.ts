import MafiaRole from '@mafia/mixins/MafiaRole';
import Role from '@mafia/Role';

class Vanilla extends Role {

	public name = 'Vanilla Mafia';

	public static documentation = 'Roleinfo docs here.';

}

export default MafiaRole(Vanilla);
