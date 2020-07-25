import Role from '@mafia/Role';
import TownFaction from '@mafia/factions/Town';

class Townie extends Role {

	public faction = new TownFaction();

}

Townie.categories.push('Random Town');

export default Townie;
