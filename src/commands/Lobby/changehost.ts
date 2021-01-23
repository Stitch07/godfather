import GodfatherCommand from '@lib/GodfatherCommand';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
  description: 'Vote to change the host',
  detailedDescription: ['The host can use this command to instantly make the next player the host.'].join('\n'),
  preconditions: ['GuildOnly', 'GameOnly', 'PlayerOnly', 'AlivePlayerOnly']
})
export default class extends GodfatherCommand {
  public async run(message: Message) {
    const { game } = message.channel;

    if (game!.hasStarted) throw 'You cannot change the host after the game has started.';
    if (game!.players.length < 3) throw 'You need at least 3 players to change the host.';

    let toChange = false;
    if (message.author.id === game!.host.user.id) {
      toChange = true;
    } else {
      if (game!.players.voteKicks.has(message.author.id)) throw 'You have already voted to change the host.';
      game!.players.voteKicks.add(message.author.id);
      await message.react('✅');

      const { majorityVotes } = game!;
      if (game!.players.voteKicks.size >= majorityVotes) toChange = true;
    }

    if (toChange) {
      // Since host is always player #1, we remove the old host from the beginning
      // (so #2 becomes host) and add the old host back at the end.
      const oldHost = game!.players.shift()!;
      game!.players.push(oldHost);
      game!.players.voteKicks.clear();

      await message.channel.send(`The host is now ${game!.host}.`);
    }
  }
}
