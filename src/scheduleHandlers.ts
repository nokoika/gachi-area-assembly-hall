import { Bot, sendDirectMessage } from "./deps/discordeno.ts";
import { fetchAreaSchedule } from "./fetchAreaSchedule.ts";
import {
  discordMessageRepository,
  recruitmentLogRepository,
  recruitmentRepository,
} from "./repositories.ts";
import { createMatching, createRecruitmentsFromSchedules } from "./logics.ts";
import {
  generateInsufficientMessage,
  generateMatchResultMessage,
  generateNotHeldMessage,
  generateRecruitingMessage,
  generateScheduleMessage,
  getRecruitingChannel,
} from "./generateBotMessage.ts";
import { discordEnv } from "./env.ts";
import {
  applicationQueryService,
  recruitmentQueryService,
  userQueryService,
} from "./queryServices.ts";

export const scheduleHandlers = {
  // #スケジュール に当日の開催予定表をコメントする
  async sendScheduleMessage(bot: Bot): Promise<void> {
    const areaSchedules = await fetchAreaSchedule();

    // 予定をDBにいれておく (冪等にしたほうがいいか？)
    const recruitments = createRecruitmentsFromSchedules(areaSchedules);
    await recruitmentRepository.insertMany(recruitments);

    const message = generateScheduleMessage(recruitments);
    await bot.helpers.sendMessage(discordEnv.channelIds.schedule, message);
  },

  // 募集コメントをする
  async sendRecruitingMessage(bot: Bot): Promise<void> {
    const recruitment = await recruitmentQueryService.findRecent();

    // 募集しない時刻の場合はスキップ
    if (!recruitment) return;

    const message = generateRecruitingMessage(recruitment);
    const channel = getRecruitingChannel(recruitment.type);
    await bot.helpers.sendMessage(channel, message);
  },

  // 参加者が不足しているときにコメントする
  async sendInsufficientMessage(bot: Bot): Promise<void> {
    const recruitment = await recruitmentQueryService.findRecent();

    // 募集しない時刻の場合はスキップ
    if (!recruitment) return;

    const applications = await applicationQueryService.find({
      recruitmentId: recruitment.id,
    });
    const roomCount = applications.length / 8 | 0;
    const remainder = applications.length % 8;
    if (remainder < 5) {
      // 通知しても意味なさそうなので通知しない
      return;
    }
    const message = generateInsufficientMessage(roomCount, remainder);
    const channel = getRecruitingChannel(recruitment.type);
    await bot.helpers.sendMessage(channel, message);
  },

  // マッチング結果をルーム1~5およびDMにて通知する
  async sendMatchResult(bot: Bot): Promise<void> {
    const recruitment = await recruitmentQueryService.findRecent();

    // 募集しない時刻の場合はスキップ
    if (!recruitment) return;

    await discordMessageRepository.deleteChannelMessages(
      bot,
      getRecruitingChannel(recruitment.type),
    );

    const applications = await applicationQueryService.find({
      recruitmentId: recruitment.id,
    });
    const users = await userQueryService.find({
      ids: applications.map((a) => a.id),
    });

    const matchingResult = createMatching(recruitment, applications, users);
    await recruitmentLogRepository.insert(matchingResult);

    for (const idx in matchingResult.rooms) {
      const room = matchingResult.rooms[idx];
      const message = generateMatchResultMessage(room, recruitment);
      await bot.helpers.sendMessage(discordEnv.channelIds.rooms[idx], message);
    }

    for (const user of matchingResult.remainders) {
      await sendDirectMessage(
        bot,
        BigInt(user.discordUserId),
        generateNotHeldMessage(matchingResult),
      );
    }
  },
};
