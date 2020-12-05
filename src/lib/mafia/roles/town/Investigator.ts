import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import Player from '@mafia/Player';

class Investigator extends SingleTarget {

	public name = 'Investigator';
	public description = 'You may investigate someone every night, returning a list of roles including your targets.';
	public action = 'investigate';
	public actionGerund = 'investigating';
	public actionText = 'investigate a player';
	public priority = NightActionPriority.INVEST;

	public async tearDown(actions: NightActionsManager, target: Player) {
		let results = this.getResult(target.role.name);
		if (actions.framedPlayers.includes(target)) results = this.getResult('Framer');
		await this.player.user.send(results);
	}

	private getResult(roleName: string) {
		switch (roleName) {
			// non-tos roles still need to be added
			case 'Executioner':
			case 'Werewolf':
			case 'Cop':
			case 'Insane Cop':
			case 'Paranoid Cop':
			case 'Naive Cop':
				return 'Your target could be a Cop, Executioner, or Werewolf.';
			case 'Goon':
			case 'Vigilante':
			case 'Veteran':
			case 'Ambusher':
				return 'Your target could be a Vigilante, Veteran, Goon, or Ambusher.';
			case 'Investigator':
			case 'Consigliere':
			case 'Mayor':
			case 'Tracker':
				return 'Your target could be a Investigator, Consigliere, Mayor, or Tracker.';
			case 'Escort':
			case 'Transporter':
			case 'Consort':
				return 'Your target could be a Escort, Transporter, or Consort';
			case 'Lookout':
			case 'Witch':
			case 'Juggernaut':
				return 'Your target could be a Lookout, Witch, or Juggernaut.';
			case 'Framer':
			case 'Jester':
				return 'Your target could be a Framer or Jester.';
			case 'Bodyguard':
			case 'Godfather':
			case 'Arsonist':
				return 'Your target could be a Bodyguard, Godfather, or Arsonist.';
			case 'Janitor':
			case 'Retributionist':
			case 'Reanimator':
				return 'Your target could be a Janitor, Retributionist, or Reanimator';
			case 'Guardian Angel':
			case 'Amnesiac':
			case 'Survivor':
				return 'Your target could be a Survivor, Amnesiac, or Guardian Angel';
			case 'Serial Killer':
			case 'Doctor':
				return 'Your target could be a Doctor or a Serial Killer';
			case 'Vanilla':
			case 'Vanilla Mafia':
			case 'Neapolitan':
			case 'Super Saint':
				return 'Your target could be a Vanilla, Vanilla Mafia, Neapolitan, or Super Saint.';
			default:
				return 'You could not find enough information about your target.';
		}
	}

}

Investigator.aliases = ['Invest'];
Investigator.categories = [...Investigator.categories, 'Town Investigative'];

export default Townie(Investigator);
