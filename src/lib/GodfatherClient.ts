import { LogLevel, SapphireClient } from "@sapphire/framework";

const DEV = process.env.NODE_ENV === "development";

export class GodfatherClient extends SapphireClient {
  public constructor() {
    super({
      intents: ["GUILDS"],
      logger: {
        level: DEV ? LogLevel.Debug : LogLevel.Info,
      },
    });
  }
}
