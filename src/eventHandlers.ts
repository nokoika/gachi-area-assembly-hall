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
import dayjs from "./deps/dayjs.ts";

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
        const user = await userQueryService.findByDiscordId(
          interaction.user.id,
        );
        let message: string;
        if (!user) {
          message =
            `フレンドコードが未登録のため、参加申請を受理できませんでした。\n<#${discordEnv.channelIds.friendCode}> にて、自分のコードを登録してください。`;
        } else {
          // TODO: すでに参加済ならすでに参加済とメッセージ出したい(かつ、前衛後衛変更できるようにしたい)
          message = (interaction.data.customId === ButtonId.ApplyFrontPlayer
            ? "後衛以外"
            : "後衛") + "枠で参加申請しました。";
        }

        await bot.helpers.sendInteractionResponse(
          interaction.id,
          interaction.token,
          {
            type: InteractionResponseTypes.ChannelMessageWithSource,
            private: true, // 返信は本人だけが確認できる
            data: {
              content: message,
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
    if (message.isBot) {
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
        } else if (message.content === "d") {
          // チャンネルの投稿を概ね削除する
          const messages = await bot.helpers.getMessages(
            discordEnv.channelIds.preparationMatch,
          );
          // TODO: repositoryに移動する？
          const deletableMessageIds = messages
            // 14日経過したメッセージは削除することができないので、filterする。
            // 境界条件をちゃんと調査していないので適当に12日以内のものに限定する
            .filter((m) => dayjs(m.timestamp).add(12, "d").isAfter(dayjs()))
            .map((m) => m.id);
          // 2件未満だとbulkDeleteできない謎仕様なので、分岐する
          if (deletableMessageIds.length >= 2) {
            await bot.helpers.deleteMessages(
              discordEnv.channelIds.preparationMatch,
              deletableMessageIds,
            );
          } else if (deletableMessageIds.length === 1) {
            await bot.helpers.deleteMessage(
              discordEnv.channelIds.preparationMatch,
              deletableMessageIds[0],
            );
          }
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
