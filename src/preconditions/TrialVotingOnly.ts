import { Phase } from '@mafia/structures/Game';
import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export default class extends Precondition {
  public run(message: Message) {
    if (message.guild !== null) return this.error('This command can only be used in Direct Messages.');

    const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)));
    if (!game) return this.error("You aren't in any active games.");

    if (game.phase === Phase.TrialVoting) return this.ok();
    return this.error('This command can only be used during trials.');
  }
}
