import { Bot } from "./deps/discordeno.ts";
import { cron } from "./deps/cron.ts";
import { scheduleHandlers } from "./scheduleHandlers.ts";

export const registerSchedules = (bot: Bot) => {
  // 毎日10時
  cron("0 0 10 * * *", () => {
    scheduleHandlers.sendScheduleMessage(bot);
  });
  // 毎時0分
  cron("0 0 * * * *", () => {
    scheduleHandlers.sendTrainingMatchRecruitingMessage(bot);
    scheduleHandlers.sendPreparationMatchRecruitingMessage(bot);
  });
  // 毎時7分
  cron("0 7 * * * *", () => {
    scheduleHandlers.resendTrainingMatchRecruitingMessage(bot);
    scheduleHandlers.resendPreparationMatchRecruitingMessage(bot);
  });
  // 毎時10分
  cron("0 10 * * * *", () => {
    scheduleHandlers.sendMatchResult(bot);
  });
};
