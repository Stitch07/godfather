import type Game from '../../structures/Game';
import Player from '../../structures/Player';
import { SingleTargetAction } from './SingleTargetAction';

export class DoubleTargetAction extends SingleTargetAction {
	public getTarget(args: string[], game: Game): Player[] {
		args = args.slice(0, 2);
		if (args.length < 2) throw game.t('roles/global:twoTargets');

		const targets = args.map((arg) => Player.resolve(game, arg)).filter((target) => target !== null) as Player[];
		if (targets.length !== 2) throw this.game.t('roles/global:invalidTarget', { maxPlayers: this.game.players.length });
		return targets;
	}

	public canTarget(target: Player[]) {
		if (target[0] === target[1]) return { check: false, reason: this.game.t('roles/global:twoDistinct') };
		if (target.some((player) => !player.isAlive)) return { check: false, reason: this.game.t('roles/global:targetDeadPlayers') };
		return { check: true, reason: '' };
	}
}
