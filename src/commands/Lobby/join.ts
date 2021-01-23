import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/structures/Game';
import Player from '@mafia/structures/Player';
import { ApplyOptions } from '@sapphire/decorators';
import type { CommandOptions } from '@sapphire/framework';
import { pluralize } from '@util/utils';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
  aliases: ['in', 'j'],
  description: 'Adds you to the playerlist of an ongoing game.',
  preconditions: ['GuildOnly', 'GameOnly']
})
export default class extends GodfatherCommand {
  public run(message: Message) {
    const { game } = message.channel;
    if (game!.players.find((player) => player.user.id === message.author.id)) {
      throw 'You have already joined.';
    }
    // prevent players from joining 2 games simultaneously
    for (const otherGame of this.context.client.games.values()) {
      if (otherGame.players.get(message.author))
        throw `You are already playing another game in ${otherGame.channel.name} (${otherGame.channel.guild.name})`;
    }
    // do not allow replacing in while the bot is processing the game
    if (game!.phase === Phase.Standby) throw 'You cannot replace in between phases.';
    if (game!.hasStarted && game!.phase) {
      if (game!.players.replacements.includes(message.author)) throw 'You are already a replacement.';
      game!.players.replacements.push(message.author);
      return message.channel.send('You have decided to become a replacement.');
    }

    if (game!.players.length >= game!.settings.maxPlayers) throw `Maximum player limit has been reached. (${game!.settings.maxPlayers})`;

    game!.players.push(new Player(message.author, game!));
    game!.createdAt = new Date();
    return message.channel.send(`✅ Successfully joined. (${pluralize(game!.players.length, 'player')})`);
  }
}
