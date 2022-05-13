import { db } from "./filedbClient.ts";
import { Application, Recruitment, RecruitmentLog, User } from "./entities.ts";
import { Collection } from "./deps/filedb.ts";
import { UUID } from "./utils/document.ts";
import { isRecent, isToday } from "./utils/date.ts";

// TODO: あとでファイルを分割する

export const userQueryService = {
  getCollection(): Promise<Collection<User>> {
    return db.getCollection<User>("users");
  },
  async find(params: { ids: UUID[] }): Promise<User[]> {
    const collection = await this.getCollection();
    return collection.findMany((user) => params.ids.includes(user.id)).value();
  },
  async findByDiscordId(discordId: string): Promise<User | undefined> {
    const collection = await this.getCollection();
    // ライブラリの型がおかしいが、1件も見つからなかったらundefinedが返却されると思う
    return collection.findOne((user) => user.discordUserId === discordId);
  },
};

export const recruitmentQueryService = {
  getCollection(): Promise<Collection<Recruitment>> {
    return db.getCollection<Recruitment>("recruitments");
  },
  // 現在の募集対象であるものを返却
  async findRecent(): Promise<Recruitment | undefined> {
    const collection = await this.getCollection();
    // ライブラリの型がおかしいが、1件も見つからなかったらundefinedが返却されると思う
    return collection.findOne((r) => isRecent(r.willStartAt));
  },
  async findTodayRecruitments(): Promise<Recruitment[]> {
    const collection = await this.getCollection();
    return collection.findMany((r) => isToday(r.willStartAt)).value();
  },
};

export const applicationQueryService = {
  getCollection(): Promise<Collection<Application>> {
    return db.getCollection<Application>("applications");
  },
  async find(params: {
    recruitmentId: UUID;
    userId?: UUID;
  }): Promise<Application[]> {
    const collection = await this.getCollection();
    return collection.findMany((a) =>
      a.recruitmentId === params.recruitmentId &&
      (!params.userId || a.userId === params.userId) &&
      !a.deletedAt
    ).value();
  },
};

export const recruitmentLogQueryService = {
  getCollection(): Promise<Collection<RecruitmentLog>> {
    return db.getCollection<RecruitmentLog>("recruitmentLogs");
  },
};
