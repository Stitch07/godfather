import { container } from "@sapphire/framework";
import "@sapphire/plugin-logger/register";
import { GodfatherClient } from "#lib/GodfatherClient";

const client = new GodfatherClient();

void client.login().then(() => container.logger.info("Logged in!"));
