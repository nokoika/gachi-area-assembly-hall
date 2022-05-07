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

export const eventHandlers: Partial<EventHandlers> = {
  ready() {
    console.log("Successfully connected to gateway");
  },

  // 主にbotが表示したボタンをユーザーが押したとき
  async interactionCreate(bot, interaction) {
    if (interaction.type !== InteractionTypes.MessageComponent) {
      return;
    }
    const applicationType = interaction.data?.customId ?? "";
    if (!hasEnumValue(applicationType, ApplicationType)) {
      return;
    }
    const recruitment = await recruitmentQueryService.findRecent();
    const user = await userQueryService.findByDiscordId(
      interaction.user.id.toString(),
    );
    if (!recruitment) {
      // 申請ボタン消すからここまで丁寧に返信しなくてもよいが
      const content = generateNotRecruitingMessage();
      await discordInteractionRepository
        .sendResponse(bot, interaction, content);
      return;
    }
    if (!user) {
      const content = generateNotFriendCodeRegisteredMessage(applicationType);
      await discordInteractionRepository
        .sendResponse(bot, interaction, content);
      return;
    }
    switch (applicationType) {
      case ApplicationType.ApplyFrontPlayer:
      case ApplicationType.ApplyBackPlayer: {
        let content: string;
        const [application] = await applicationQueryService.find({
          recruitmentId: recruitment.id,
          userId: user.id,
        });
        if (application) {
          await applicationRepository
            .updateApplicationType(user.id, recruitment.id, applicationType);
          content = generateChangeApplicationTypeMessage(applicationType);
        } else {
          await applicationRepository.insert({
            recruitmentId: recruitment.id,
            userId: user.id,
            applicationType,
          });
          content = generateCreateApplicationMessage(applicationType);
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
    // 現状、ユーザーが #フレンドコード に入力したときのみ監視している
    if (message.channelId !== discordEnv.channelIds.friendCode) return;

    const friendCode = message.content.trim();
    // フレンドコードとして妥当かどうかチェック
    const discordUserId = message.authorId.toString();
    if (friendCode.match(/^\d{4}-\d{4}-\d{4}$/)) {
      // 排他制御できてないがよしとする。。。
      const user = await userQueryService.findByDiscordId(discordUserId);
      if (user) {
        await userRepository.updateFriendCode(discordUserId, friendCode);
      } else {
        await userRepository.insert({
          discordUserId,
          friendCode,
          udemae: null,
        });
      }
      await bot.helpers.addReaction(message.channelId, message.id, "👍");
    } else {
      await bot.helpers.sendMessage(
        discordEnv.channelIds.friendCode,
        generateFriendCodeInvalidMessage(discordUserId),
      );
    }
  },
};
