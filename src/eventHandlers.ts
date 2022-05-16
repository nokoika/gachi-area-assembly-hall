import {
  Bot,
  DiscordenoInteraction,
  EventHandlers,
  InteractionTypes,
} from "./deps/discordeno.ts";
import {
  ApplicationType,
  REGISTER_FRIEND_CODE_BUTTON,
  REGISTER_FRIEND_CODE_MODAL,
} from "./constants.ts";
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
  generateFriendCodeButtonMessage,
  generateFriendCodeModalMessage,
  generateNotFriendCodeRegisteredMessage,
  generateNotRecruitingMessage,
} from "./generateBotMessage.ts";
import { getUdemaeFromRole } from "./converters.ts";
import { scheduleHandlers } from "./scheduleHandlers.ts";
import { Application } from "./entities.ts";

// TODO: ファイルわける

export const interactionServices = {
  async registerFriendCode(bot: Bot, interaction: DiscordenoInteraction) {
    // ライブラリの型がおかしい
    const components = interaction.data?.components?.[0]
      .components as unknown as Array<{ custom_id: string; value: string }>;
    const friendCode = components.find((c) =>
      c.custom_id === REGISTER_FRIEND_CODE_MODAL
    )?.value;

    if (!friendCode) {
      throw new Error("friendCode could not be found");
    }
    const discordUserId = interaction.user.id.toString();
    // フレンドコードとして妥当かどうかチェック
    if (!friendCode.match(/^\d{4}-\d{4}-\d{4}$/)) {
      // bot が反応しなければ modal にエラー文がながれる
      return;
    }

    // 排他制御できてないがよしとする。。。連投こわい
    const user = await userQueryService.findByDiscordId(discordUserId);
    if (user) {
      await userRepository.updateFriendCode(user.id, friendCode);
    } else {
      await userRepository.insert({ discordUserId, friendCode });
    }
    await discordInteractionRepository
      .sendResponse(bot, interaction, "フレンドコードを登録しました👍");
  },

  async openModal(bot: Bot, interaction: DiscordenoInteraction) {
    const content = generateFriendCodeModalMessage();
    await discordInteractionRepository
      .sendModal(bot, interaction, content);
  },

  async updateApplication(bot: Bot, interaction: DiscordenoInteraction) {
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
    const application: Application | undefined = await applicationQueryService
      .find({ recruitmentId: recruitment.id, userId: user.id })
      .then((ary) => ary[0]);

    const type = interaction.data?.customId ?? "";
    switch (type) {
      case ApplicationType.ApplyFrontPlayer:
      case ApplicationType.ApplyBackPlayer: {
        let content: string;
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
        return;
      }
      case ApplicationType.Cancel: {
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
        return;
      }
    }
  },
};

export const eventHandlers: Partial<EventHandlers> = {
  ready() {
    console.log("Successfully connected to gateway");
  },

  // 主にbotが表示したボタンをユーザーが押したとき
  async interactionCreate(bot, interaction) {
    const customId = interaction.data?.customId ?? "";
    if (
      interaction.type === InteractionTypes.ModalSubmit &&
      customId === REGISTER_FRIEND_CODE_MODAL
    ) {
      await interactionServices.registerFriendCode(bot, interaction);
      return;
    }
    if (
      interaction.type === InteractionTypes.MessageComponent &&
      customId === REGISTER_FRIEND_CODE_BUTTON
    ) {
      await interactionServices.openModal(bot, interaction);
      return;
    }
    if (
      interaction.type === InteractionTypes.MessageComponent &&
      hasEnumValue(customId, ApplicationType)
    ) {
      await interactionServices.updateApplication(bot, interaction);
      return;
    }
  },

  // ユーザーがメッセージを書いたとき
  async messageCreate(bot, message) {
    // bot自身が送ったメッセージなら無視
    if (message.isBot) return;
    if (message.channelId !== discordEnv.channelIds.command) return;
    // テスト用/非常事態/運用
    switch (message.content.trim()) {
      case "send schedule":
        scheduleHandlers.sendScheduleMessage(bot);
        return;
      case "send recruiting":
        scheduleHandlers.sendRecruitingMessage(bot);
        return;
      case "send insufficient":
        scheduleHandlers.sendInsufficientMessage(bot);
        return;
      case "send matching":
        scheduleHandlers.sendMatchResult(bot);
        return;
      case "crash":
        throw new Error("crash message received");
      case "ping":
        await bot.helpers.sendMessage(
          discordEnv.channelIds.command,
          "pong",
        );
        return;
      case "send friend code button":
        await bot.helpers.sendMessage(
          discordEnv.channelIds.friendCode,
          generateFriendCodeButtonMessage(),
        );
        return;
    }
  },
};
