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
    command: bigint;
    rooms: bigint[];
  };
  roles: {
    x2300: bigint;
    x2400: bigint;
    x2500: bigint;
    x2600: bigint;
    x2700: bigint;
    x2800: bigint;
    x2900: bigint;
    x3000: bigint;
    x3100: bigint;
  };
  useScheduleMock: boolean;
  roomSize: number;
};

export const discordEnv: DiscordEnv = (() => {
  const token = Deno.env.get("DISCORD_TOKEN");
  const botId = Deno.env.get("BOT_ID");
  const channelIds = {
    schedule: Deno.env.get("CHANNEL_SCHEDULE"),
    friendCode: Deno.env.get("CHANNEL_FRIEND_CODE"),
    preparationMatch: Deno.env.get("CHANNEL_PREPARATION_MATCH"),
    trainingMatch: Deno.env.get("CHANNEL_TRAINING_MATCH"),
    command: Deno.env.get("CHANNEL_COMMAND"),
    rooms: [
      Deno.env.get("CHANNEL_ROOM1"),
      Deno.env.get("CHANNEL_ROOM2"),
      Deno.env.get("CHANNEL_ROOM3"),
      Deno.env.get("CHANNEL_ROOM4"),
      Deno.env.get("CHANNEL_ROOM5"),
    ],
  };
  const roles = {
    x2300: Deno.env.get("ROLE_X2300"),
    x2400: Deno.env.get("ROLE_X2400"),
    x2500: Deno.env.get("ROLE_X2500"),
    x2600: Deno.env.get("ROLE_X2600"),
    x2700: Deno.env.get("ROLE_X2700"),
    x2800: Deno.env.get("ROLE_X2800"),
    x2900: Deno.env.get("ROLE_X2900"),
    x3000: Deno.env.get("ROLE_X3000"),
    x3100: Deno.env.get("ROLE_X3100"),
  };
  const useScheduleMock = Deno.env.get("USE_SCHEDULE_MOCK");
  const roomSize = Deno.env.get("ROOM_SIZE");

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
  if (!channelIds.command) {
    throw new Error("env var CHANNEL_COMMAND is not set");
  }
  for (const idx in channelIds.rooms) {
    const room = channelIds.rooms[idx];
    if (!room) {
      throw new Error(`env var CHANNEL_ROOM${idx} is not set`);
    }
  }
  if (!roles.x2300) {
    throw new Error("env var ROLE_X2300 is not set");
  }
  if (!roles.x2400) {
    throw new Error("env var ROLE_X2400 is not set");
  }
  if (!roles.x2500) {
    throw new Error("env var ROLE_X2500 is not set");
  }
  if (!roles.x2600) {
    throw new Error("env var ROLE_X2600 is not set");
  }
  if (!roles.x2700) {
    throw new Error("env var ROLE_X2700 is not set");
  }
  if (!roles.x2800) {
    throw new Error("env var ROLE_X2800 is not set");
  }
  if (!roles.x2900) {
    throw new Error("env var ROLE_X2900 is not set");
  }
  if (!roles.x3000) {
    throw new Error("env var ROLE_X3000 is not set");
  }
  if (!roles.x3100) {
    throw new Error("env var ROLE_X3100 is not set");
  }
  if (useScheduleMock === undefined) {
    throw new Error("env var USE_SCHEDULE_MOCK is not set");
  }
  if (!roomSize) {
    throw new Error("env var ROOM_SIZE is not set");
  }

  const converted: DiscordEnv = {
    token,
    botId: BigInt(botId),
    channelIds: {
      schedule: BigInt(channelIds.schedule),
      friendCode: BigInt(channelIds.friendCode),
      preparationMatch: BigInt(channelIds.preparationMatch),
      trainingMatch: BigInt(channelIds.trainingMatch),
      command: BigInt(channelIds.command),
      rooms: (channelIds.rooms as string[]).map(BigInt), // undefinedチェック済のため型アサーションする
    },
    roles: {
      x2300: BigInt(roles.x2300),
      x2400: BigInt(roles.x2400),
      x2500: BigInt(roles.x2500),
      x2600: BigInt(roles.x2600),
      x2700: BigInt(roles.x2700),
      x2800: BigInt(roles.x2800),
      x2900: BigInt(roles.x2900),
      x3000: BigInt(roles.x3000),
      x3100: BigInt(roles.x3100),
    },
    useScheduleMock: !!useScheduleMock,
    roomSize: Number(roomSize),
  };
  return converted;
})();
