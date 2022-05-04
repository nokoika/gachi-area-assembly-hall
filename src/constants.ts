type ValueOf<T> = T[keyof T];

export const MatchType = {
  Preparation: "preparation",
  Training: "training",
} as const;
export type MatchType = ValueOf<typeof MatchType>;

export const ButtonId = {
  ApplyFrontPlayer: "apply-front-player", // 前衛として参加申請する
  ApplyBackPlayer: "apply-back-player", // 後衛として参加申請する
  Cancel: "cancel", // 参加申請をキャンセルする
} as const;
export type ButtonId = ValueOf<typeof ButtonId>;
