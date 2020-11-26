import GodfatherCommand from '@lib/GodfatherCommand';
import PlayerEntity from '@lib/orm/entities/Player';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { getConnection } from 'typeorm';

@ApplyOptions<CommandOptions>({
	preconditions: [],
	strategyOptions: {
		options: ['faction', 'role']
	}
})
export default class extends GodfatherCommand {

	public async run(message: Message, args: Args) {
		const user = await args.pick('user').catch(() => message.author);
		const [faction, role] = [args.getOption('faction'), args.getOption('role')];

		const whereClauses = [
			'player.user_id = :id',
			faction ? 'player.faction = :faction' : null,
			role ? 'player.role_name = :role' : null
		].filter(clause => clause !== null).join(' AND ');

		const results: PlayerResult[] = await getConnection()
			.createQueryBuilder()
			.select('player.result')
			.from(PlayerEntity, 'player')
			.where(whereClauses, { id: user.id, role, faction })
			.groupBy('player.result')
			.addGroupBy('player.id')
			.orderBy('player.result', 'DESC')
			.getRawMany();

		const wins = results.filter(result => result.player_result).length;
		const losses = results.filter(result => !result.player_result).length;
		const totalGames = wins + losses;
		const winRate = totalGames === 0 ? 'N/A' : `${Math.round(wins * 100 / totalGames)}%`;

		return message.channel.send([
			`Games: ${totalGames}`,
			`Wins: ${wins}`,
			`Winrate: ${winRate}`
		].join('\n'));
	}

}

export interface PlayerResult {
	player_result: boolean;
}