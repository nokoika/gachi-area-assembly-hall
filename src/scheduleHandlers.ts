import { Bot } from "./deps/discordeno.ts";
import { fetchAreaSchedule } from "./fetchAreaSchedule.ts";
import { recruitmentRepository } from "./repositories.ts";
import { createRecruitmentsFromSchedules } from "./logics.ts";
import {
  generateInsufficientMessage,
  generateRecruitingMessage,
  generateScheduleMessage,
  getRecruitingChannel,
} from "./generateBotMessage.ts";
import { discordEnv } from "./env.ts";
import {
  applicationQueryService,
  recruitmentQueryService,
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
    const currentRecruitment = await recruitmentQueryService.findRecent();

    // 募集しない時刻の場合はスキップ
    if (!currentRecruitment) return;

    const message = generateRecruitingMessage(currentRecruitment);
    const channel = getRecruitingChannel(currentRecruitment.type);
    await bot.helpers.sendMessage(channel, message);
  },

  // 参加者が不足しているときにコメントする
  async sendInsufficientMessage(bot: Bot): Promise<void> {
    const currentRecruitment = await recruitmentQueryService.findRecent();

    // 募集しない時刻の場合はスキップ
    if (!currentRecruitment) return;

    const applications = await applicationQueryService.find({
      recruitmentId: currentRecruitment.id,
    });
    const roomCount = applications.length / 8 | 0;
    const remainder = applications.length % 8;
    if (remainder < 5) {
      // 通知しても意味なさそうなので通知しない
      return;
    }
    const message = generateInsufficientMessage(roomCount, remainder);
    const channel = getRecruitingChannel(currentRecruitment.type);
    await bot.helpers.sendMessage(channel, message);
  },

  // マッチング結果をルーム1~5およびDMにて通知する
  async sendMatchResult(bot: Bot): Promise<void> {
  },
};
