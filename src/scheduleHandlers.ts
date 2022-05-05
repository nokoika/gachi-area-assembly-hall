import { Bot } from "./deps/discordeno.ts";
export const scheduleHandlers = {
  // #スケジュール に当日の開催予定表をコメントする
  sendScheduleMessage(bot: Bot): void {},
  // #トレーニングマッチ で募集コメントをする
  sendTrainingMatchRecruitingMessage(bot: Bot): void {},
  // #トレーニングマッチ にて、参加者が不足しているときにコメントする
  resendTrainingMatchRecruitingMessage(bot: Bot): void {},
  // #0次会プラべ で募集コメントをする
  sendPreparationMatchRecruitingMessage(bot: Bot): void {},
  // #0次会プラべ にて、参加者が不足しているときにコメントする
  resendPreparationMatchRecruitingMessage(bot: Bot): void {},
  // マッチング結果をルーム1~5およびDMにて通知する
  sendMatchResult(bot: Bot): void {},
};
