import {
  ButtonStyles,
  CreateMessage,
  Embed,
  MessageComponentTypes,
} from "./deps/discordeno.ts";
import dayjs from "./deps/dayjs.ts";
import { ApplicationType, RecruitingType } from "./constants.ts";
import { Recruitment, RecruitmentLog, RoomLog } from "./entities.ts";
import { CreateArg } from "./utils/document.ts";
import { discordEnv } from "./env.ts";

type MatchDetail = {
  confirmed: boolean; // マッチングが確定しているかどうか
  recruitingType: RecruitingType;
  // 確定していないとき、親のフレンドコードは表示を省略する
  parentFriendCode?: string;
  willStartAt: Date;
  grouping?: string; // チーム分けの説明
  stages: string[];
};

const toRecruitingTypeText = (type: RecruitingType): string => {
  const texts = {
    [RecruitingType.Preparation]: "0次会プラベ",
    [RecruitingType.Training]: "トレーニングマッチ",
  };
  return texts[type];
};

const toMatchStatusText = (matchConfirmed: boolean): string => {
  return matchConfirmed ? "開催決定！" : "参加者募集中！";
};

const wrapCodeblock = (text: string): string => {
  return "```\n" + text + "```";
};

const toMatchPlainText = (type: RecruitingType): string => {
  const texts = {
    [RecruitingType.Preparation]: "各ステージを交互に3戦ずつ",
    [RecruitingType.Training]: "各ステージ1戦ずつ",
  };
  return texts[type];
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

const toMention = (discordUserId: bigint | string): string => {
  return `<@${discordUserId}>`;
};

export const generateMatchEmbed = (matchDetail: MatchDetail): Embed => {
  const title = toRecruitingTypeText(matchDetail.recruitingType) +
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
      name: ":bar_chart: 試合数など",
      value: wrapCodeblock(toMatchPlainText(matchDetail.recruitingType)),
      inline: true,
    },
    {
      name: ":park: ステージ",
      value: wrapCodeblock(
        matchDetail.stages.length === 2
          ? matchDetail.stages.join("/")
          : matchDetail.stages.join("\n"),
      ),
      inline: false,
    },
    {
      name: ":gun: 武器変更",
      value: wrapCodeblock(
        "可 (後衛枠かどうかは変わらない範囲で)",
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
        "可",
      ),
      inline: true,
    },
    {
      name: ":camera: 観戦",
      value: wrapCodeblock(
        "不可",
      ),
      inline: true,
    },
    {
      name: ":play_pause: 配信/動画化",
      value: wrapCodeblock(
        "可 (不穏等ない範囲で)",
      ),
      inline: false,
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
  if (matchDetail.grouping) {
    fields.push({
      name: ":game_die: チーム分け",
      value: wrapCodeblock(matchDetail.grouping),
      inline: false,
    });
  }

  return {
    title,
    type: "rich",
    color: Math.floor(Math.random() * 16777215),
    fields,
  };
};

export const generateRecruitingMessage = (
  { willStartAt, stages, type }: Recruitment,
): CreateMessage => {
  return {
    content: "@everyone",
    embeds: [
      generateMatchEmbed({
        confirmed: false,
        recruitingType: type,
        willStartAt,
        stages,
      }),
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
    }開催まであと${discordEnv.roomSize - remainder}人です！`,
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
            toTimeText(r.willStartAt) + " " + toRecruitingTypeText(r.type) +
            (r.type === RecruitingType.Preparation
              ? ` (${r.stages.join("/")})`
              : "")
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

export const generateNotRecruitingMessage = (): string => {
  return "現在募集時間外のため、申請できませんでした。";
};

export const generateNotFriendCodeRegisteredMessage = (): string => {
  return `フレンドコードが未登録のため、申請を受理できませんでした。\n<#${discordEnv.channelIds.friendCode}> にて自分のコードを登録してください。`;
};

export const generateChangeApplicationTypeMessage = (
  type: ApplicationType,
): string => {
  const typeText = type === ApplicationType.ApplyFrontPlayer ? "後衛以外" : "後衛";
  return typeText + "枠に参加申請を変更しました。";
};

export const generateCreateApplicationMessage = (
  type: ApplicationType,
): string => {
  const typeText = type === ApplicationType.ApplyFrontPlayer ? "後衛以外" : "後衛";
  return typeText + "枠で参加申請しました。";
};

export const generateCanceledMessage = (): string => {
  return "キャンセルしました！";
};

export const generateCancelFailedMessage = (): string => {
  return "キャンセルは参加申請をしたときのみ行えます";
};

export const generateFriendCodeInvalidMessage = (
  discordUserId: string,
): string => {
  return `${
    toMention(discordUserId)
  } お手数ですが、 \`XXXX-XXXX-XXXX\` の形式でフレンドコードの再入力をよろしくお願いします :pray:`;
};

export const generateNotHeldMessage = (
  matchResult: CreateArg<RecruitmentLog>,
) => {
  if (matchResult.rooms.length) {
    return "すみません、抽選の結果落選となりました :sob:";
  }
  return `${
    toRecruitingTypeText(matchResult.recruitment.type)
  }は開催されませんでした :cry:`;
};

export const generateMatchResultMessage = (
  room: RoomLog,
  recruitment: Recruitment,
): CreateMessage => {
  const mentions = room.players.map((u) => {
    const mention = toMention(u.discordUserId);
    const host = room.host.discordUserId === u.discordUserId ? " <親>" : "";
    const back = room.backPlayers.map((back) => back.id).includes(u.id)
      ? " [後衛]"
      : "";
    return mention + host + back;
  });
  const groupings: Record<number, string> = {
    0: "後衛０枚であるため、全員ランダム",
    1: "後衛１枚であるため、全員ランダム",
    2: "後衛２枚であるため、後衛プレイヤーをアルファ/ブラボーに分け、残り6人はランダムに分けてください",
    3: [
      "後衛３枚であるため、以下のようにしてください。",
      "・後衛枠の方は、自分が使用する武器をチャンネルにて宣言してください。",
      "・最も射程の長い後衛ブキ2枚をアルファ/ブラボー、残り6人をランダムで分けてください。",
      "・後衛ブキ被りがある場合は、被っている後衛ブキを使用するプレイヤーをアルファ/ブラボー、残り6人はランダムで分けてください。",
      // TODO: 誰と誰を分ける、をメッセージに組み込めると親切。現在、ユーザー名を収集してないのでまだ実現できない
      "・3人とも同じ後衛ブキを使用する場合は、XPロールが近い2人をアルファ/ブラボー、残り6人をランダムで分けてください。",
    ].join("\n"),
    4: "後衛４枚であるため、全員ランダム",
    5: "後衛５枚であるため、全員ランダム",
    6: "後衛６枚であるため、全員ランダム",
    7: "後衛７枚であるため、全員ランダム",
    8: "後衛８枚であるため、全員ランダム",
  };
  return {
    content: mentions.join("\n"),
    embeds: [generateMatchEmbed({
      confirmed: true,
      recruitingType: recruitment.type,
      parentFriendCode: room.host.friendCode,
      willStartAt: recruitment.willStartAt,
      stages: recruitment.stages,
      grouping: groupings[room.backPlayers.length],
    })],
  };
};
