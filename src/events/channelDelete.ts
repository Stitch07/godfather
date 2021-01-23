import type GodfatherChannel from '@root/lib/extensions/GodfatherChannel';
import { Event, Events, PieceContext } from '@sapphire/framework';

export default class extends Event<Events.ChannelDelete> {
  public constructor(context: PieceContext) {
    super(context, { event: Events.ChannelDelete });
  }

  public async run(channel: GodfatherChannel) {
    await channel.game?.delete();
  }
}
