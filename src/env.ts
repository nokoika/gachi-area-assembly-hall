import { config } from "./deps.ts";

config({ safe: true, export: true, path: "./env/.env" });

type DiscordEnv = {
  token: string
  botId: bigint
}

export const discordEnv: DiscordEnv = (() => {
  const token = Deno.env.get("DISCORD_TOKEN")
  const botId = Deno.env.get("BOT_ID")
  if (!token) {
    throw new Error("env var DISCORD_TOKEN is not set");
  }
  if (!botId) {
    throw new Error("env var BOT_ID is not set");
  }
  return { token, botId: BigInt(botId) }
})()
