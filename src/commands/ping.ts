import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";

export class PingCommand extends Command {
    constructor(context: Command.LoaderContext) {
        super(context, {
            description: "Ping pong command",
        });
    }

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
        );
    }

    public async chatInputRun(interaction: ChatInputCommandInteraction) {
        await interaction.reply("Pong!");
    }
}