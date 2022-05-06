import { config } from "./deps/dotenv.ts";

config({ safe: true, export: true, path: "./env/.env" });

type DiscordEnv = {
  token: string;
  botId: bigint;
  channelIds: {
    schedule: bigint;
    friendCode: bigint;
    preparationMatch: bigint;
    trainingMatch: bigint;
    rooms: bigint[];
  };
};

export const discordEnv: DiscordEnv = (() => {
  const token = Deno.env.get("DISCORD_TOKEN");
  const botId = Deno.env.get("BOT_ID");
  const channelIds = {
    schedule: Deno.env.get("CHANNEL_SCHEDULE"),
    friendCode: Deno.env.get("CHANNEL_FRIEND_CODE"),
    preparationMatch: Deno.env.get("CHANNEL_PREPARATION_MATCH"),
    trainingMatch: Deno.env.get("CHANNEL_TRAINING_MATCH"),
    rooms: [
      Deno.env.get("CHANNEL_ROOM1"),
      Deno.env.get("CHANNEL_ROOM2"),
      Deno.env.get("CHANNEL_ROOM3"),
      Deno.env.get("CHANNEL_ROOM4"),
      Deno.env.get("CHANNEL_ROOM5"),
    ],
  };

  if (!token) {
    throw new Error("env var DISCORD_TOKEN is not set");
  }
  if (!botId) {
    throw new Error("env var BOT_ID is not set");
  }
  if (!channelIds.schedule) {
    throw new Error("env var CHANNEL_SCHEDULE is not set");
  }
  if (!channelIds.friendCode) {
    throw new Error("env var CHANNEL_FRIEND_CODE is not set");
  }
  if (!channelIds.preparationMatch) {
    throw new Error("env var CHANNEL_PREPARATION_MATCH is not set");
  }
  if (!channelIds.trainingMatch) {
    throw new Error("env var CHANNEL_TRAINING_MATCH is not set");
  }
  for (const idx in channelIds.rooms) {
    const room = channelIds.rooms[idx];
    if (!room) {
      throw new Error(`env var CHANNEL_ROOM${idx} is not set`);
    }
  }

  const converted: DiscordEnv = {
    token,
    botId: BigInt(botId),
    channelIds: {
      schedule: BigInt(channelIds.schedule),
      friendCode: BigInt(channelIds.friendCode),
      preparationMatch: BigInt(channelIds.preparationMatch),
      trainingMatch: BigInt(channelIds.trainingMatch),
      rooms: (channelIds.rooms as string[]).map(BigInt), // undefinedチェック済のため型アサーションする
    },
  };
  return converted;
})();
