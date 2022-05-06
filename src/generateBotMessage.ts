import {
  ButtonStyles,
  CreateMessage,
  Embed,
  MessageComponentTypes,
} from "./deps/discordeno.ts";
import dayjs from "./deps/dayjs.ts";
import { ApplicationType, MatchType } from "./constants.ts";
import { Recruitment } from "./entities.ts";
import { CreateArg } from "./utils/document.ts";
import { discordEnv } from "./env.ts";

type MatchDetail = {
  confirmed: boolean; // マッチングが確定しているかどうか
  type: MatchType;
  // 確定していないとき、親のフレンドコードは表示を省略する
  // TODO: Union型で表現する
  parentFriendCode?: string;
  willStartAt: Date;
  stages: string[];
};

const toMatchTypeText = (matchType: MatchType): string => {
  const texts = {
    [MatchType.Preparation]: "0次会プラベ",
    [MatchType.Training]: "トレーニングマッチ",
  };
  return texts[matchType];
};

const toMatchStatusText = (matchConfirmed: boolean): string => {
  return matchConfirmed ? "開催決定！" : "参加者募集中！";
};

const wrapCodeblock = (text: string): string => {
  return "```\n" + text + "```";
};

const toMatchPlainText = (matchType: MatchType): string => {
  const texts = {
    [MatchType.Preparation]: "各ステージを交互に3戦ずつ",
    [MatchType.Training]: "各ステージ1戦ずつ",
  };
  return texts[matchType];
};

const toStageText = (matchType: MatchType, stages: string[]) => {
  if (matchType === MatchType.Training) {
    return "今月のステージ";
  }
  return stages.join("/");
};

const toDateText = (date: Date | dayjs.Dayjs): string => {
  return dayjs(date).format("YYYY-MM-DD");
};

const toTimeText = (date: Date | dayjs.Dayjs): string => {
  return dayjs(date).format("HH:mm");
};

const toDateTimeText = (date: Date | dayjs.Dayjs): string => {
  return dayjs(date).format("YYYY-MM-DD HH:mm");
};

export const generateMatchEmbed = (matchDetail: MatchDetail): Embed => {
  const title = toMatchTypeText(matchDetail.type) +
    toMatchStatusText(matchDetail.confirmed);

  const fields = [
    {
      name: ":alarm_clock: 開催日時",
      value: wrapCodeblock(
        toDateTimeText(dayjs(matchDetail.willStartAt).minute(20)),
      ),
      inline: false,
    },
    {
      name: ":crossed_swords: ルール",
      value: wrapCodeblock("ガチエリア"),
      inline: true,
    },
    {
      name: ":park: ステージ",
      value: wrapCodeblock(
        toStageText(matchDetail.type, matchDetail.stages),
      ),
      inline: true,
    },
    {
      name: ":bar_chart: 試合数など",
      value: wrapCodeblock(toMatchPlainText(matchDetail.type)),
      inline: false,
    },
    {
      name: ":gun: 武器変更",
      value: wrapCodeblock(
        "あり(後衛枠かどうかは変わらない範囲で)",
      ),
      inline: false,
    },
    {
      name: ":calling: 通話",
      value: wrapCodeblock("なし"),
      inline: true,
    },
    {
      name: ":athletic_shoe: ギア変更",
      value: wrapCodeblock(
        "あり",
      ),
      inline: true,
    },
    {
      name: ":camera: 観戦",
      value: wrapCodeblock(
        "なし",
      ),
      inline: true,
    },
  ];
  if (matchDetail.parentFriendCode) {
    fields.unshift(
      {
        name: ":hearts: 親フレンドコード",
        value: wrapCodeblock(matchDetail.parentFriendCode),
        inline: true,
      },
    );
  }

  return {
    title,
    type: "rich",
    color: 15576321,
    fields,
  };
};

export const getRecruitingChannel = (matchType: MatchType): bigint => {
  const o = {
    [MatchType.Preparation]: discordEnv.channelIds.preparationMatch,
    [MatchType.Training]: discordEnv.channelIds.trainingMatch,
  };
  return o[matchType];
};

export const generateRecruitingMessage = (
  { willStartAt, stages, type }: Recruitment,
): CreateMessage => {
  return {
    content: "@everyone",
    embeds: [
      generateMatchEmbed({ confirmed: false, type, willStartAt, stages }),
    ],
    components: [
      {
        type: MessageComponentTypes.ActionRow,
        components: [
          {
            type: MessageComponentTypes.Button,
            customId: ApplicationType.ApplyFrontPlayer,
            style: ButtonStyles.Primary,
            label: "参加申請する(後衛以外)",
          },
          {
            type: MessageComponentTypes.Button,
            customId: ApplicationType.ApplyBackPlayer,
            style: ButtonStyles.Secondary,
            label: "参加申請する(後衛)",
          },
          {
            type: MessageComponentTypes.Button,
            customId: ApplicationType.Cancel,
            style: ButtonStyles.Danger,
            label: "キャンセル",
          },
        ],
      },
    ],
  };
};

export const generateInsufficientMessage = (
  currentRoom: number,
  remainder: number,
): CreateMessage => {
  return {
    content: `@everyone ↑${currentRoom + 1}部屋${
      currentRoom >= 1 ? "同時" : ""
    }開催まであと${8 - remainder}人です！`,
  };
};

export const generateTrainingMatchResultMessage = (): CreateMessage => {
  return {
    embeds: [generateMatchEmbed({
      confirmed: true,
      type: MatchType.Preparation,
      parentFriendCode: "0000-0000-0000",
      willStartAt: new Date(),
      stages: ["海女美術大学", "マンタマリア号"],
    })],
  };
};

const generateScheduleEmbed = (
  recruitments: CreateArg<Recruitment>[],
): Embed => {
  return {
    title: "スケジュール",
    type: "rich",
    color: 15576321,
    fields: [{
      name: `:date: ${toDateText(recruitments[0].willStartAt)}`,
      value: wrapCodeblock(
        recruitments
          .map((r) =>
            toTimeText(r.willStartAt) + " " + toMatchTypeText(r.type) +
            (r.type === MatchType.Preparation ? ` (${r.stages.join("/")})` : "")
          )
          .join("\n"),
      ),
      inline: false,
    }],
  };
};

export const generateScheduleMessage = (
  recruitments: CreateArg<Recruitment>[],
): CreateMessage => {
  return {
    content: "@everyone",
    embeds: [generateScheduleEmbed(recruitments)],
  };
};
