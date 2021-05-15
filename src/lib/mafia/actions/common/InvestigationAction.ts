import type Player from '@mafia/structures/Player';
import NightActionsManager, { NightActionPriority } from '../../managers/NightActionsManager';
import type { ActionRole } from '../../structures/ActionRole';
import { SingleTargetAction } from '../mixins/SingleTargetAction';

export class InvestigationAction extends SingleTargetAction {
	public name = 'investigate';
	public priority = NightActionPriority.Investigative;
	public constructor(role: ActionRole, numUsesRemaining = Number.POSITIVE_INFINITY) {
		super(role);
		this.actionText = this.game.t('roles/actions:investigationText');
		this.actionGerund = this.game.t('roles/actions:investigationGerund');
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
