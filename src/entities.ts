import { ApplicationType, RecruitingType, Udemae } from "./constants.ts";
import { Document, UUID } from "./utils/document.ts";

// TODO: あとでファイルを分割する

export type User = Document<{
  discordUserId: string; // DB 的に bigint が扱えるか不明なので文字列で保存する
  friendCode: string;
  udemae: Udemae | null;
  participationCount: number;
}>;

export type Recruitment = Document<{
  type: RecruitingType;
  stages: string[];
  willStartAt: Date;
}>;

export type Application = Document<{
  recruitmentId: UUID;
  userId: UUID;
  type: ApplicationType;
  deletedAt: Date | null;
}>;

export type RoomLog = {
  players: User[];
  backPlayers: User[];
  host: User;
};

export type RecruitmentLog = Document<{
  recruitment: Recruitment;
  applications: Application[];
  rooms: RoomLog[];
  remainders: User[];
}>;

export type AreaSchedule = {
  maps: string[];
  start: Date;
  end: Date;
};
