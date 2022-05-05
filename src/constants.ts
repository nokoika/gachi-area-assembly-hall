type ValueOf<T> = T[keyof T];

export const MatchType = {
  Preparation: "preparation",
  Training: "training",
} as const;
export type MatchType = ValueOf<typeof MatchType>;

export const ApplicationType = {
  ApplyFrontPlayer: "apply-front-player", // 前衛として参加申請する
  ApplyBackPlayer: "apply-back-player", // 後衛として参加申請する
  Cancel: "cancel", // 参加申請をキャンセルする
} as const;
export type ApplicationType = ValueOf<typeof ApplicationType>;

export const Udemae = {
  X2300: "X2300",
  X2400: "X2400",
  X2500: "X2500",
  X2600: "X2600",
  X2700: "X2700",
  X2800: "X2800",
  X2900: "X2900",
  X3000: "X3000",
  X3100: "X3100",
} as const;
export type Udemae = ValueOf<typeof Udemae>;
