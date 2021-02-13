import NightActionsManager, { NightActionPriority } from '@mafia/managers/NightActionsManager';
import SingleTarget from '@mafia/mixins/SingleTarget';
import Townie from '@mafia/mixins/Townie';
import type Player from '@mafia/structures/Player';

class Investigator extends SingleTarget {
	public name = 'Investigator';
	public description = 'You may investigate someone every night, returning a list of roles including your targets.';
	public action = 'investigate';
	public priority = NightActionPriority.INVEST;

	public constructor(player: Player) {
		super(player);
		this.description = this.game.t('roles/neutral:investigatorDescription');
		this.actionText = this.game.t('roles/actions:investigatorText');
		this.actionGerund = this.game.t('roles/actions:investigatorGerund');
	}

	public tearDown(actions: NightActionsManager, target: Player) {
		let results = this.getResult(target.role.name);
		if (actions.framedPlayers.includes(target)) {
			results = this.getResult('Framer');
			actions.framedPlayers.splice(actions.framedPlayers.indexOf(target), 1);
		}
		return this.player.queueMessage(results);
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
				return this.game.t('roles/town:investResultA');
			case 'Goon':
			case 'Vigilante':
			case 'Veteran':
			case 'Ambusher':
				return this.game.t('roles/town:investResultB');
			case 'Investigator':
			case 'Consigliere':
			case 'Mayor':
			case 'Tracker':
				return this.game.t('roles/town:investResultC');
			case 'Escort':
			case 'Transporter':
			case 'Consort':
				return this.game.t('roles/town:investResultD');
			case 'Lookout':
			case 'Witch':
			case 'Juggernaut':
				return this.game.t('roles/town:investResultE');
			case 'Framer':
			case 'Jester':
			case 'Cult Leader':
			case 'Super Saint':
				return this.game.t('roles/town:investResultF');
			case 'Bodyguard':
			case 'Godfather':
			case 'Arsonist':
			case 'Crusader':
				return this.game.t('roles/town:investResultG');
			case 'Janitor':
			case 'Retributionist':
			case 'Reanimator':
				return this.game.t('roles/town:investResultH');
			case 'Guardian Angel':
			case 'Amnesiac':
			case 'Survivor':
				return this.game.t('roles/town:investResultI');
			case 'Serial Killer':
			case 'Doctor':
				return this.game.t('roles/town:investResultJ');
			case 'Vanilla':
			case 'Vanilla Mafia':
			case 'Neapolitan':
			case 'Cult Member':
				return this.game.t('roles/town:investResultK');
			default:
				return this.game.t('roles/town:investResultDefault');
		}
	}
}

Investigator.aliases = ['Invest'];
Investigator.categories = [...Investigator.categories, 'Town Investigative'];

export default Townie(Investigator);
