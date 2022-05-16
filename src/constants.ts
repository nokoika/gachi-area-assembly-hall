type ValueOf<T> = T[keyof T];

export const RecruitingType = {
  Preparation: "preparation",
  Training: "training",
} as const;
export type RecruitingType = ValueOf<typeof RecruitingType>;

export const ApplicationType = {
  ApplyFrontPlayer: "apply-front-player", // 前衛として参加申請する
  ApplyBackPlayer: "apply-back-player", // 後衛として参加申請する
  Cancel: "cancel", // 参加申請をキャンセルする
} as const;
export type ApplicationType = ValueOf<typeof ApplicationType>;

export const Udemae = {
  X2300: 2300,
  X2400: 2400,
  X2500: 2500,
  X2600: 2600,
  X2700: 2700,
  X2800: 2800,
  X2900: 2900,
  X3000: 3000,
  X3100: 3100,
} as const;
export type Udemae = ValueOf<typeof Udemae>;

export const REGISTER_FRIEND_CODE_BUTTON =
  "register-friend-code-button" as const;

export const REGISTER_FRIEND_CODE_MODAL = "register-friend-code-modal" as const;
