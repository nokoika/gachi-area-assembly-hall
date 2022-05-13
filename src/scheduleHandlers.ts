import { Bot, sendDirectMessage } from "./deps/discordeno.ts";
import { fetchAreaSchedule } from "./fetchAreaSchedule.ts";
import {
  discordMessageRepository,
  recruitmentLogRepository,
  recruitmentRepository,
} from "./repositories.ts";
import { createMatching } from "./logics/createMatching.ts";
import { createRecruitmentsFromSchedules } from "./logics/createRecruitmentsFromSchedules.ts";
import {
  generateInsufficientMessage,
  generateMatchResultMessage,
  generateNotHeldMessage,
  generateRecruitingMessage,
  generateScheduleMessage,
} from "./generateBotMessage.ts";
import { getRecruitingChannel } from "./converters.ts";
import { discordEnv } from "./env.ts";
import {
  applicationQueryService,
  recruitmentQueryService,
  userQueryService,
} from "./queryServices.ts";
import { Recruitment } from "./entities.ts";
import { CreateArg } from "./utils/document.ts";
import { RecruitingType } from "./constants.ts";

export const scheduleHandlers = {
  // #スケジュール に当日の開催予定表をコメントする
  async sendScheduleMessage(bot: Bot): Promise<void> {
    let recruitments: CreateArg<Recruitment>[] = await recruitmentQueryService
      .findTodayRecruitments();

    // 冪等のため、ないときのみDBにいれる
    if (!recruitments.length) {
      const areaSchedules = await fetchAreaSchedule();
      recruitments = createRecruitmentsFromSchedules(
        areaSchedules,
      );
      // 予定をDBにいれておく
      await recruitmentRepository.insertMany(recruitments);
    }

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
    const roomCount = applications.length / discordEnv.roomSize | 0;
    const remainder = applications.length % discordEnv.roomSize;
    // のこり4人以上あつめないと同時開催数が増えないとき、
    // 通知しても意味なさそうなので通知しない
    if (remainder === 0 || discordEnv.roomSize - remainder > 3) {
      return;
    }
    const message = generateInsufficientMessage(roomCount, remainder);
    const channel = getRecruitingChannel(recruitment.type);
    await bot.helpers.sendMessage(channel, message);
  },

  // マッチング結果をルーム1~5およびDMにて通知する
  async sendMatchResult(bot: Bot): Promise<void> {
    // 募集チャンネルのメッセージ消す
    for (
      const recruitingType of [
        RecruitingType.Preparation,
        RecruitingType.Training,
      ]
    ) {
      await discordMessageRepository.deleteChannelMessages(
        bot,
        getRecruitingChannel(recruitingType),
      );
    }

    const recruitment = await recruitmentQueryService.findRecent();

    // 募集しない時刻の場合はスキップ
    if (!recruitment) return;

    const applications = await applicationQueryService.find({
      recruitmentId: recruitment.id,
    });
    const users = await userQueryService.find({
      ids: applications.map((a) => a.userId),
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
