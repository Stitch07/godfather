import Role from '@mafia/Role';
import MafiaFaction from '@mafia/factions/Mafia';

export default function MafiaRole<TBaseRole extends typeof Role>(BaseRole: TBaseRole) {

	// @ts-ignore tsc bug
	class MafiaRole extends BaseRole {

		public faction = new MafiaFaction();

		public async onDeath() {
			// if the GF died, try promoting the Goon
			if (this.player.role!.name === 'Godfather') {
				const goon = this.game.players.find(player => player.isAlive && player.role!.name === 'Goon');
				if (!goon) {
				// if there aren't any goons, promote the next mafia member to Goon
					const otherMafia = this.game.players.find(player => player.isAlive && player.role!.faction.name === 'Mafia' && !['Godfather', 'Goon'].includes(player.role!.name));
					if (!otherMafia) return;

					// otherMafia.role = new Goon()
					await otherMafia.user.send('You have been promoted to a Goon!');
					await otherMafia.sendPM();
					return;
				}

				// goon.role = new Godfather()
				await goon.user.send('You have been promoted to the Godfather!');
				await goon.sendPM();

			} else if (this.player.role!.name === 'Goon') {
				const otherMafia = this.game.players.find(player => player.isAlive && player.role!.faction.name === 'Mafia' && !['Godfather', 'Goon'].includes(player.role!.name));
				if (!otherMafia) return;

				otherMafia.previousRoles.push(otherMafia.role!);
				// otherMafia.role = new Goon()
				await otherMafia.user.send('You have been promoted to a Goon!');
				await otherMafia.sendPM();
			}

			return super.onDeath();
		}

	}

	MafiaRole.categories.push('Random Mafia');
	return MafiaRole;

}
