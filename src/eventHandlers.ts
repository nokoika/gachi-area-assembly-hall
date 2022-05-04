import {
  EventHandlers,
  InteractionResponseTypes,
  InteractionTypes,
} from "./deps/discordeno.ts";
import { generateTrainingMatchRecruitingMessage } from "./generateBotMessage.ts";
import { ButtonId } from "./constants.ts";
import { discordEnv } from "./env.ts";
import { userQueryService } from "./queryServices.ts";
import { userRepository } from "./repositories.ts";

export const eventHandlers: Partial<EventHandlers> = {
  ready() {
    console.log("Successfully connected to gateway");
  },
  async interactionCreate(bot, interaction) {
    if (interaction.type !== InteractionTypes.MessageComponent) {
      return;
    }
    switch (interaction.data?.customId) {
      case ButtonId.ApplyFrontPlayer:
      case ButtonId.ApplyBackPlayer: {
        await bot.helpers.sendInteractionResponse(
          interaction.id,
          interaction.token,
          {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            private: true, // 返信は本人だけが確認できる
            data: {
              content: "OK!",
            },
          },
        );
        break;
      }
      case ButtonId.Cancel: {
        await bot.helpers.sendInteractionResponse(
          interaction.id,
          interaction.token,
          {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            private: true, // 返信は本人だけが確認できる
            data: {
              content: "キャンセルしました!",
            },
          },
        );
        break;
      }
    }
  },
  async messageCreate(bot, message) {
    // bot自身が送ったメッセージなら無視
    if (message.authorId === discordEnv.botId) {
      return;
    }
    switch (message.channelId) {
      case discordEnv.channelIds.preparationMatch: {
        // testing
        if (message.content === "p") {
          await bot.helpers.sendMessage(
            discordEnv.channelIds.preparationMatch,
            generateTrainingMatchRecruitingMessage(),
          );
        }
        break;
      }
      case discordEnv.channelIds.friendCode: {
        const friendCode = message.content.trim();
        // フレンドコードとして妥当かどうかチェック
        if (friendCode.match(/^\d{4}-\d{4}-\d{4}$/)) {
          await userRepository.upsertUser(message.authorId, friendCode);
          await bot.helpers.addReaction(message.channelId, message.id, "👍");
        } else {
          await bot.helpers.sendMessage(discordEnv.channelIds.friendCode, {
            content:
              `<@${message.authorId}> お手数ですが、フレンドコードは \`XXXX-XXXX-XXXX\` の形式で再入力のほどよろしくお願いします :pray:`,
          });
        }
      }
    }
  },
};
