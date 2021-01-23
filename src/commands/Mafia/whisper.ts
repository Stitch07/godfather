import GodfatherCommand from '@lib/GodfatherCommand';
import { Phase } from '@mafia/structures/Game';
import { ApplyOptions } from '@sapphire/decorators';
import type { Args, CommandOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { handleRequiredArg } from '@util/utils';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
  aliases: ['w'],
  preconditions: ['DMOnly', { name: 'Cooldown', context: { delay: Time.Second * 10 } }]
})
export default class extends GodfatherCommand {
  public async run(message: Message, args: Args) {
    const game = this.context.client.games.find((game) => Boolean(game.players.get(message.author)));
    if (!game) throw "You aren't in any active games!";

    if (game.settings.disableWhispers) throw 'Whispering is disabled in this game.';
    if (!game.hasStarted) throw "The game hasn't started yet!";
    if (game.phase !== Phase.Day) throw 'You can only whisper during the day.';

    const player = game.players.get(message.author);
    // @ts-ignore Mayor
    if (player.role.name === 'Mayor' && player.role.hasRevealed) throw 'As a revealed Mayor, you cannot whisper.';
    if (!player?.isAlive) throw 'You cannot whisper as a dead player.';

    const target = await args.pick('player', { game }).catch(handleRequiredArg('player'));
    // @ts-ignore Mayor
    if (target.role.name === 'Mayor' && target.role.hasRevealed) throw 'You cannot whisper to a revealed Mayor.';
    if (!target.isAlive) throw 'You cannot whisper to dead players';
    const whisperContent = await args.rest('string').catch(() => {
      throw 'What are you trying to whisper?';
    });

    try {
      await target.user.send(`Whisper from **${message.author.tag}**: "${whisperContent}"`);
      await message.react('✅');
    } catch {
      return message.channel.send(`Whisper failed: ${target} doesn't have DMs open.`);
    } finally {
      await game.channel.send(`**${message.author.tag}** is whispering to **${target.user.tag}**.`);
    }
  }
}
