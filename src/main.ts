import { createBot, startBot } from "./deps.ts";
import { enableCachePlugin, enableCacheSweepers } from "./deps.ts";
import { discordEnv } from "./env.ts"

const baseBot = createBot({
  token: discordEnv.token,
  intents: ["Guilds", "GuildMessages"],
  botId: discordEnv.botId,
  events: {
    ready() {
      console.log("Successfully connected to gateway");
    },
    messageCreate(bot: any, message: any) {
      // Process the message with your command handler here
    },
  },
});

const bot = enableCachePlugin(baseBot);

enableCacheSweepers(bot);

await startBot(bot);
