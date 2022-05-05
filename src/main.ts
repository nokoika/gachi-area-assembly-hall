import { createBot, startBot } from "./deps/discordeno.ts";
import {
  enableCachePlugin,
  enableCacheSweepers,
} from "./deps/discordeno_cache_plugin.ts";
import { discordEnv } from "./env.ts";
import { eventHandlers } from "./eventHandlers.ts";
import { registerSchedules } from "./registerSchedules.ts";

const baseBot = createBot({
  token: discordEnv.token,
  intents: ["Guilds", "GuildMessages", "GuildMessageReactions"],
  botId: discordEnv.botId,
  events: eventHandlers,
});

registerSchedules(baseBot);

const bot = enableCachePlugin(baseBot);
enableCacheSweepers(bot);

await startBot(bot);
