import type { Command } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { GodfatherCommand } from "#lib/GodfatherCommand";

export class PingCommand extends GodfatherCommand {
  public constructor(context: Command.Context) {
    super(context, {
      description: "Runs a connection test to Discord.",
      chatInputCommand: {
        register: true,
      },
    });
  }

  public chatInputRun(interaction: CommandInteraction) {
    return interaction.reply("Pong!");
  }
}
