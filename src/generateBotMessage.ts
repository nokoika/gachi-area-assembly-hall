import {
  ButtonStyles,
  CreateMessage,
  Embed,
  MessageComponentTypes,
} from "./deps/discordeno.ts";
import dayjs from "./deps/dayjs.ts";
import { ApplicationType, MatchType } from "./constants.ts";

type MatchDetail = {
  confirmed: boolean; // マッチングが確定しているかどうか
  type: MatchType;
  // 確定していないとき、親のフレンドコードは表示を省略する
  // TODO: Union型で表現する
  parentFriendCode?: string;
  willStartAt: Date;
  stageNames: string[];
};

const getMatchTypeText = (matchType: MatchType): string => {
  const texts = {
    [MatchType.Preparation]: "0次会プラベ",
    [MatchType.Training]: "トレーニングマッチ",
  };
  return texts[matchType];
};

const getMatchStatusText = (matchConfirmed: boolean): string => {
  return matchConfirmed ? "開催決定！" : "参加者募集中！";
};

const wrapCodeblock = (text: string): string => {
  return "```\n" + text + "```";
};

const getMatchPlanText = (matchType: MatchType): string => {
  const texts = {
    [MatchType.Preparation]: "各ステージを交互に3戦ずつ",
    [MatchType.Training]: "各ステージ1戦ずつ",
  };
  return texts[matchType];
};

const getStageText = (matchType: MatchType, stageNames: string[]) => {
  if (matchType === MatchType.Training) {
    return "今月のステージ";
  }
  return stageNames.join("/");
};

export const generateMatchEmbed = (matchDetail: MatchDetail): Embed => {
  const title = getMatchTypeText(matchDetail.type) +
    getMatchStatusText(matchDetail.confirmed);

  const fields = [
    {
      name: ":alarm_clock: 開催日時",
      value: wrapCodeblock(
        dayjs(matchDetail.willStartAt).add(20, "m").format(
          "YYYY/MM/DD HH:mm",
        ),
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
        getStageText(matchDetail.type, matchDetail.stageNames),
      ),
      inline: true,
    },
    {
      name: ":bar_chart: 試合数など",
      value: wrapCodeblock(getMatchPlanText(matchDetail.type)),
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

export const generateTrainingMatchRecruitingMessage = (): CreateMessage => {
  return {
    content: "@everyone",
    embeds: [generateMatchEmbed({
      confirmed: false,
      type: MatchType.Preparation,
      willStartAt: new Date(),
      stageNames: ["海女美術大学", "マンタマリア号"],
    })],
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

export const generateTrainingMatchResultMessage = (): CreateMessage => {
  return {
    embeds: [generateMatchEmbed({
      confirmed: true,
      type: MatchType.Preparation,
      parentFriendCode: "0000-0000-0000",
      willStartAt: new Date(),
      stageNames: ["海女美術大学", "マンタマリア号"],
    })],
  };
};
