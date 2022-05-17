import {
  ButtonStyles,
  CreateMessage,
  DiscordenoInteractionResponse,
  Embed,
  InteractionResponseTypes,
  MessageComponentTypes,
} from "./deps/discordeno.ts";
import dayjs from "./deps/dayjs.ts";
import {
  ApplicationType,
  RecruitingType,
  REGISTER_FRIEND_CODE_BUTTON,
  REGISTER_FRIEND_CODE_MODAL,
} from "./constants.ts";
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

const generateRandomColor = (): number => {
  return Math.floor(Math.random() * 16777215);
};

export const generateMatchEmbed = (matchDetail: MatchDetail): Embed => {
  const title = toRecruitingTypeText(matchDetail.recruitingType) +
    toMatchStatusText(matchDetail.confirmed);

  const fields = [
    {
      name: "開催日時 :clock10:",
      value: toDateTimeText(dayjs(matchDetail.willStartAt).minute(20)),
      inline: false,
    },
    {
      name: "ルール :badminton:",
      value: "ガチエリア",
      inline: true,
    },
    {
      name: "試合数など :arrows_counterclockwise: ",
      value: toMatchPlainText(matchDetail.recruitingType),
      inline: true,
    },
    {
      name: "ステージ :beach:",
      value: matchDetail.stages.length === 2
        ? matchDetail.stages.join("/")
        : matchDetail.stages.join("\n"),
      inline: false,
    },
    {
      name: "武器変更 :gun:",
      value: "後衛枠かどうか変わらない範囲で武器変更可",
      inline: false,
    },
    {
      name: "通話 :no_mobile_phones: ",
      value: "なし",
      inline: true,
    },
    {
      name: "ギア変更 :martial_arts_uniform:",
      value: "可",
      inline: true,
    },
    {
      name: "観戦 :eye:",
      value: "不可",
      inline: true,
    },
    {
      name: "配信/動画化 :play_pause:",
      value: "可 (不穏等ない範囲で)",
      inline: false,
    },
  ];
  if (matchDetail.parentFriendCode) {
    fields.unshift(
      {
        name: "親フレンドコード :woman_astronaut:",
        value: matchDetail.parentFriendCode,
        inline: true,
      },
    );
  }
  if (matchDetail.grouping) {
    fields.push({
      name: "チーム分け :game_die:",
      value: matchDetail.grouping,
      inline: false,
    });
  }

  return {
    title,
    type: "rich",
    color: generateRandomColor(),
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
            label: "参加申請する(前衛中衛)",
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
    color: generateRandomColor(),
    fields: [{
      name: `${toDateText(recruitments[0].willStartAt)} :date:`,
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
  const typeText = type === ApplicationType.ApplyFrontPlayer ? "前衛中衛" : "後衛";
  return typeText + "枠に参加申請を変更しました。\n10分になるまでしばらくお待ち下さい :coffee:";
};

export const generateCreateApplicationMessage = (
  type: ApplicationType,
): string => {
  const typeText = type === ApplicationType.ApplyFrontPlayer ? "前衛中衛" : "後衛";
  return typeText + "枠で参加申請しました。\n10分になるまでしばらくお待ち下さい :coffee:";
};

export const generateCanceledMessage = (): string => {
  return "キャンセルしました！";
};

export const generateCancelFailedMessage = (): string => {
  return "キャンセルは参加申請をしたときのみ行えます";
};

export const generateFriendCodeButtonMessage = (): CreateMessage => {
  return {
    content: "以下のボタンを押してフレンドコードを登録してください。",
    components: [
      {
        type: MessageComponentTypes.ActionRow,
        components: [
          {
            type: MessageComponentTypes.Button,
            customId: REGISTER_FRIEND_CODE_BUTTON,
            style: ButtonStyles.Primary,
            label: "フレンドコードを登録",
          },
        ],
      },
    ],
  };
};

export const generateFriendCodeModalMessage =
  (): DiscordenoInteractionResponse => {
    return {
      type: InteractionResponseTypes.Modal,
      private: true, // 返信は本人だけが確認できる
      data: {
        title: "フレンドコードの登録",
        customId: REGISTER_FRIEND_CODE_MODAL,
        components: [
          {
            type: MessageComponentTypes.ActionRow,
            components: [
              {
                type: MessageComponentTypes.InputText,
                customId: REGISTER_FRIEND_CODE_MODAL,
                placeholder: "XXXX-XXXX-XXXX",
                style: 1, // 1: Short, 2: Paragraph https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-styles
                label: "フレンドコード (XXXX-XXXX-XXXX の形式で入力してください 🙏)",
                required: true,
                minLength: 14,
                maxLength: 14,
              },
            ],
          },
        ],
      },
    };
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
    const host = room.host.discordUserId === u.discordUserId ? "<親>" : "";
    const back = room.backPlayers.map((back) => back.id).includes(u.id)
      ? "[後衛]"
      : "";
    const alpha = room.alpha.map((a) => a.id).includes(u.id) ? "(アルファ)" : "";
    const bravo = room.bravo.map((b) => b.id).includes(u.id) ? "(ブラボー)" : "";

    return [mention, host, back, alpha, bravo].join(" ");
  });
  const groupings: Record<number, string> = {
    0: "後衛０枚であるため、全員ランダム",
    1: "後衛１枚であるため、全員ランダム",
    2: "後衛２枚であるため、上記 (アルファ)(ブラボー) マークをもとに後衛プレイヤーを分け、残り6人はランダムに分けてください",
    3: "後衛３枚であるため、上記 (アルファ)(ブラボー) マークをもとに後衛プレイヤーを分け、残り6人はランダムに分けてください",
    4: "後衛４枚であるため、上記 (アルファ)(ブラボー) マークをもとに後衛プレイヤーを分け、残り4人はランダムに分けてください",
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
