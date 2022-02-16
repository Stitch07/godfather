import { ApplyOptions } from "@sapphire/decorators";
import type { Command } from "@sapphire/framework";
import { DiscordSnowflake } from "@sapphire/snowflake";
import type { CommandInteraction } from "discord.js";
import { GodfatherCommand } from "#lib/GodfatherCommand";

@ApplyOptions<Command.Options>({
  description: "Runs a connection test to Discord.",
  chatInputCommand: {
    register: true,
  },
})
export class PingCommand extends GodfatherCommand {
  public async chatInputRun(interaction: CommandInteraction) {
    const reply = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    const timestamp = DiscordSnowflake.timestampFrom(reply.id);
    const diff = timestamp - interaction.createdTimestamp;
    const ping = Math.round(this.client.ws.ping);

    return interaction.editReply(
      `Pong 🏓! (Round-trip took: ${diff}ms. Heartbeat: ${ping}ms.)`
    );
  }
}
