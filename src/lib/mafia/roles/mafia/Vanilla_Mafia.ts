import MafiaRole from '#mafia/mixins/MafiaRole';
import Role from '#mafia/structures/Role';

class VanillaMafia extends Role {

	public name = 'Vanilla Mafia';

	public description = 'You have no night actions. Your vote is your only power.';

}

VanillaMafia.aliases = [...VanillaMafia.aliases, 'Mafia Vanilla'];

export default MafiaRole(VanillaMafia);
