import { EventHandlers, InteractionTypes } from "./deps/discordeno.ts";
import { ApplicationType } from "./constants.ts";
import { discordEnv } from "./env.ts";
import {
  applicationQueryService,
  recruitmentQueryService,
  userQueryService,
} from "./queryServices.ts";
import {
  applicationRepository,
  discordInteractionRepository,
  userRepository,
} from "./repositories.ts";
import { hasEnumValue } from "./utils/typeGuards.ts";
import {
  generateCanceledMessage,
  generateCancelFailedMessage,
  generateChangeApplicationTypeMessage,
  generateCreateApplicationMessage,
  generateFriendCodeInvalidMessage,
  generateNotFriendCodeRegisteredMessage,
  generateNotRecruitingMessage,
} from "./generateBotMessage.ts";
import { getUdemaeFromRole } from "./converters.ts";
import { scheduleHandlers } from "./scheduleHandlers.ts";

export const eventHandlers: Partial<EventHandlers> = {
  ready() {
    console.log("Successfully connected to gateway");
  },

  // 主にbotが表示したボタンをユーザーが押したとき
  async interactionCreate(bot, interaction) {
    if (interaction.type !== InteractionTypes.MessageComponent) {
      return;
    }
    const type = interaction.data?.customId ?? "";
    if (!hasEnumValue(type, ApplicationType)) {
      return;
    }
    const recruitment = await recruitmentQueryService.findRecent();
    const user = await userQueryService.findByDiscordId(
      interaction.user.id.toString(),
    );
    if (!recruitment) {
      // 申請ボタン消すからここまで丁寧に返信しなくてもよいかも
      const content = generateNotRecruitingMessage();
      await discordInteractionRepository
        .sendResponse(bot, interaction, content);
      return;
    }
    if (!user) {
      const content = generateNotFriendCodeRegisteredMessage();
      await discordInteractionRepository
        .sendResponse(bot, interaction, content);
      return;
    }
    switch (type) {
      case ApplicationType.ApplyFrontPlayer:
      case ApplicationType.ApplyBackPlayer: {
        let content: string;
        const [application] = await applicationQueryService.find({
          recruitmentId: recruitment.id,
          userId: user.id,
        });
        const udemae = getUdemaeFromRole(interaction.member?.roles ?? []);
        // ウデマエロールが設定されてないなら、そもそも募集チャンネル開けないはずなので考慮不要
        if (!udemae) return;
        await userRepository.updateUdemae(user.id, udemae);
        if (application) {
          await applicationRepository
            .updateApplicationType(user.id, recruitment.id, type);
          content = generateChangeApplicationTypeMessage(type);
        } else {
          await applicationRepository.insert({
            recruitmentId: recruitment.id,
            userId: user.id,
            type,
          });
          content = generateCreateApplicationMessage(type);
        }

        await discordInteractionRepository
          .sendResponse(bot, interaction, content);
        break;
      }
      case ApplicationType.Cancel: {
        const [application] = await applicationQueryService.find({
          recruitmentId: recruitment.id,
          userId: user.id,
        });
        if (!application) {
          const content = generateCancelFailedMessage();
          await discordInteractionRepository
            .sendResponse(bot, interaction, content);
          return;
        }
        const content = generateCanceledMessage();
        await applicationRepository.cancel(user.id, recruitment.id);
        await discordInteractionRepository
          .sendResponse(bot, interaction, content);
        break;
      }
    }
  },

  // ユーザーがメッセージを書いたとき
  async messageCreate(bot, message) {
    // bot自身が送ったメッセージなら無視
    if (message.isBot) return;
    switch (message.channelId) {
      // #フレンドコード 入力監視
      case discordEnv.channelIds.friendCode: {
        const friendCode = message.content.trim();
        // フレンドコードとして妥当かどうかチェック
        const discordUserId = message.authorId.toString();
        if (friendCode.match(/^\d{4}-\d{4}-\d{4}$/)) {
          // 排他制御できてないがよしとする。。。連投こわい
          const user = await userQueryService.findByDiscordId(discordUserId);
          if (user) {
            await userRepository.updateFriendCode(user.id, friendCode);
          } else {
            await userRepository.insert({ discordUserId, friendCode });
          }
          await bot.helpers.addReaction(message.channelId, message.id, "👍");
        } else {
          await bot.helpers.sendMessage(
            discordEnv.channelIds.friendCode,
            generateFriendCodeInvalidMessage(discordUserId),
          );
        }
        break;
      }
      // テスト用/非常事態用。batchを発火する
      case discordEnv.channelIds.command: {
        switch (message.content.trim()) {
          case "send schedule":
            scheduleHandlers.sendScheduleMessage(bot);
            break;
          case "send recruiting":
            scheduleHandlers.sendRecruitingMessage(bot);
            break;
          case "send insufficient":
            scheduleHandlers.sendInsufficientMessage(bot);
            break;
          case "send matching":
            scheduleHandlers.sendMatchResult(bot);
            break;
          case "crash":
            throw new Error("crash message received");
        }
        break;
      }
    }
  },
};
