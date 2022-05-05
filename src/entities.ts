import { ApplicationType, Udemae } from "./constants.ts";
import { Document, UUID } from "./utils/document.ts";

// TODO: あとでファイルを分割する

export type User = Document<{
  discordUserId: string; // DB 的に bigint が扱えるか不明なので文字列で保存する
  friendCode: string;
  udemae: Udemae | null;
}>;

export type Recruitment = Document<{
  willStartAt: Date;
}>;

export type Application = Document<{
  recruitmentId: UUID;
  userId: UUID;
  applicationType: ApplicationType;
  deletedAt: Date | null;
}>;

export type RecruitmentLog = Document<{
  recruitment: Recruitment;
  applications: Application[];
  rooms: {
    id: UUID;
    textChannelIdx: number;
    players: User[];
    hostUserId: UUID;
  };
}>;
