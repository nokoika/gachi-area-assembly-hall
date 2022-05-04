import { createBot, sendMessage, startBot } from "./deps/discordeno.ts";
import {
  enableCachePlugin,
  enableCacheSweepers,
} from "./deps/discordeno_cache_plugin.ts";
import { discordEnv } from "./env.ts";
import { generateTrainingMatchResultMessage } from "./generateBotMessage.ts";

const baseBot = createBot({
  token: discordEnv.token,
  intents: ["Guilds", "GuildMessages"],
  botId: discordEnv.botId,
  events: {
    ready() {
      console.log("Successfully connected to gateway");
    },
    messageCreate(bot, message) {
      if (
        message.content === "p" &&
        message.channelId === discordEnv.channelIds.preparationMatch
      ) {
        sendMessage(
          bot,
          discordEnv.channelIds.preparationMatch,
          generateTrainingMatchResultMessage(),
        );
      }
    },
  },
});

const bot = enableCachePlugin(baseBot);

enableCacheSweepers(bot);

await startBot(bot);
