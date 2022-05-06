import { Bot } from "./deps/discordeno.ts";
import { fetchAreaSchedule } from "./fetchAreaSchedule.ts";
import { recruitmentRepository } from "./repositories.ts";
import { createRecruitmentsFromSchedules } from "./logics.ts";
import { generateScheduleMessage } from "./generateBotMessage.ts";
import { discordEnv } from "./env.ts";

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
  // #トレーニングマッチ で募集コメントをする
  async sendTrainingMatchRecruitingMessage(bot: Bot): Promise<void> {},
  // #トレーニングマッチ にて、参加者が不足しているときにコメントする
  async resendTrainingMatchRecruitingMessage(bot: Bot): Promise<void> {},
  // #0次会プラべ で募集コメントをする
  async sendPreparationMatchRecruitingMessage(bot: Bot): Promise<void> {},
  // #0次会プラべ にて、参加者が不足しているときにコメントする
  async resendPreparationMatchRecruitingMessage(bot: Bot): Promise<void> {},
  // マッチング結果をルーム1~5およびDMにて通知する
  async sendMatchResult(bot: Bot): Promise<void> {},
};
