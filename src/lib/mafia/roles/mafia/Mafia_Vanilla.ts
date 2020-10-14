import MafiaRole from '@mafia/mixins/MafiaRole';
import Role from '@mafia/Role';

class MafiaVanilla extends Role {

	public name = 'Vanilla Mafia';

	public description = 'You have no night actions. Your vote is your only power.';

	public static documentation = 'Roleinfo docs here.';

}

export default MafiaRole(MafiaVanilla);
