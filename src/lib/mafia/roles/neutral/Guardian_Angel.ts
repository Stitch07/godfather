import NoTarget from '@mafia/mixins/NoTarget';
import GuardianAngelFaction from '@mafia/factions/neutral/GuardianAngel';
import Player from '@mafia/Player';
import { randomArray, remove } from '@root/lib/util/utils';
import { allRoles } from '..';
import NightActionsManager, { Attack, NightActionPriority } from '@mafia/managers/NightActionsManager';

class Guardian_Angel extends NoTarget {

	public name = 'Guardian Angel';
	public description = 'Your only goal is to keep your target alive, twice a game you may heal and purge your target. This may be done after you die.';
	public faction = new GuardianAngelFaction();
	public action = 'protect';
	public actionGerund = 'protecting your target';
	public actionText = 'protect your target';
	public priority = NightActionPriority.GUARDIAN_ANGEL;

	public target!: Player;
	private protects: number;

	public constructor(player: Player, context: GuardianAngelContext = {}) {
		super(player);
		if (context.protects) this.protects = context.protects;
		else this.protects = this.getInitialProtects();
	}

	public async init() {
		const possibleTargets = this.game.players.filter(player => player.role.name !== 'Jester' && player.role.name !== 'Executioner' && player.role.name !== 'Guardian Angel');
		if (possibleTargets.length === 0) {
			await this.player.user.send('There are no valid targets in game. You have become a Survivor!');
			const Survivor = allRoles.get('Survivor')!;
			this.player.role = new Survivor(this.player, { vests: 0 });
			return this.player.sendPM();
		}

		this.target = randomArray(possibleTargets)!;
		return this.player.user.send(`Your target is ${this.target.user.username}.`);
	}

	public canUseAction() {
		if (this.protects === 0) return { check: false, reason: 'You have no protects left' };
		if (!this.player.isAlive) return { check: true, reason: '' };
		return super.canUseAction();
	}

	public async onDay() {
		if (!this.target.isAlive) {
			await this.player.user.send('Your target has died! You have become a survivor.');
			const Survivor = allRoles.get('Survivor')!;
			this.player.role = new Survivor(this.player, { vests: 0 });
			return this.player.sendPM();
		}
	}

	public async onNight() {
		remove(this.game.nightActions.protectedPlayers, player => player === this.target);

		if (!this.target.isAlive) {
			await this.player.user.send('Your target has died! You have become a survivor.');
			const Survivor = allRoles.get('Survivor')!;
			this.player.role = new Survivor(this.player, { vests: 0 });
			return this.player.sendPM();
		}

		return super.onNight();
	}

	public runAction(actions: NightActionsManager) {
		const playerRecord = actions.record.get(this.target.user.id);
		if (playerRecord.has('nightkill')) {
			const nightKills = playerRecord.get('nightkill');
			if (nightKills.result === true && nightKills.type && nightKills.type < Attack.Unstoppable) {
				playerRecord.set('nightkill', { result: false, by: [] });

				const heals = playerRecord.get('heal');
				heals.result = true;
				heals.by.push(this.player);
				playerRecord.set('heal', heals);

				actions.record.set(this.target.user.id, playerRecord);
				this.player.user.send('Your target was attacked.');
			}
		}

		actions.protectedPlayers.push(this.target);
		return this.protects--;
	}

	public async tearDown(actions: NightActionsManager) {
		const record = actions.record.get(this.target.user.id).get('heal');
		const success = record.result && record.by.includes(this.player);

		if (success) {
			await this.target.user.send('You were attacked but your Guardian Angel saved you!');
		}
		await this.game.channel.send(`A Guardian Angel has protected ${this.target.user.username}!`);
	}

	public get extraNightContext() {
		if (this.protects > 0) return `You can protect your target ${this.protects} more time${this.protects === 1 ? '' : 's'}.`;
		return null;
	}

	private getInitialProtects() {
		if (this.game.players.length <= 5) return 1;
		if (this.game.players.length <= 10) return 2;
		return 3;
	}

}

export interface GuardianAngelContext {
	protects?: number;
}

Guardian_Angel.aliases = ['GA'];
Guardian_Angel.categories = [...Guardian_Angel.categories, 'Neutral Benign'];

export default Guardian_Angel;
