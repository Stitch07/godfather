import { container } from "@sapphire/framework";
import "@sapphire/plugin-logger/register";
import { GodfatherClient } from "#lib/GodfatherClient";

const client = new GodfatherClient({
    intents: []
});

void client.login(process.env.DISCORD_TOKEN).then(() => container.logger.info("Logged in!"));
