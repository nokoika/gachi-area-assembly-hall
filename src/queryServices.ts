import { db } from "./filedbClient.ts";
import { Application, Recruitment, RecruitmentLog, User } from "./entities.ts";
import { Collection } from "./deps/filedb.ts";

// TODO: あとでファイルを分割する

export const userQueryService = {
  getCollection(): Promise<Collection<User>> {
    return db.getCollection<User>("users");
  },
  async findByDiscordId(id: string): Promise<User | undefined> {
    const collection = await this.getCollection();
    // ライブラリの型がおかしいが、1件も見つからなかったらundefinedが返却されると思う
    return collection.findOne((user) => user.discordUserId === id);
  },
  // userIdから検索するのも必要かも
};

export const recruitmentQueryService = {
  getCollection(): Promise<Collection<Recruitment>> {
    return db.getCollection<Recruitment>("recruitments");
  },
};

export const applicationQueryService = {
  getCollection(): Promise<Collection<Application>> {
    return db.getCollection<Application>("applications");
  },
};

export const recruitmentLogQueryService = {
  getCollection(): Promise<Collection<RecruitmentLog>> {
    return db.getCollection<RecruitmentLog>("recruitmentLogs");
  },
};
