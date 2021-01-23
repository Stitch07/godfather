import Modifier from '@mafia/structures/Modifier';
import type Role from '@mafia/structures/Role';
import { Attack } from '../managers/NightActionsManager';

const VALID_ROLES = ['Vigilante', 'Goon', 'Godfather', 'Serial Killer'];

export default class StrongmanModifier extends Modifier {
	public patch(role: Role) {
		role.modifiers.attack = Attack.Powerful;
	}

	public canPatch(role: Role) {
		return VALID_ROLES.includes(role.name);
	}
}
