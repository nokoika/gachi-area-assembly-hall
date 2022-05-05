import { db } from "./filedbClient.ts";
import { Application, Recruitment, RecruitmentLog, User } from "./entities.ts";
import { Collection } from "./deps/filedb.ts";
import { CreateArg, createDocument, updateDocument } from "./utils/document.ts";
import { Udemae } from "./constants.ts";
import { userQueryService } from "./queryServices.ts";

// TODO: あとでファイルを分割する

export const userRepository = {
  getCollection(): Promise<Collection<User>> {
    return db.getCollection<User>("users");
  },
  async insert(data: CreateArg<User>): Promise<void> {
    const collection = await this.getCollection();
    collection.insertOne(createDocument(data));
  },
  async updateFriendCode(
    discordUserId: string,
    friendCode: string,
  ): Promise<void> {
    const collection = await this.getCollection();
    collection.updateOne(
      (user) => user.discordUserId === discordUserId,
      updateDocument<User>({ friendCode }),
    );
  },
  async updateUdemae(discordUserId: bigint, udemae: Udemae): Promise<void> {
    const collection = await this.getCollection();
    collection.updateOne(
      (user) => BigInt(user.discordUserId) === discordUserId,
      updateDocument<User>({ udemae }),
    );
  },
};

export const recruitmentRepository = {
  getCollection(): Promise<Collection<Recruitment>> {
    return db.getCollection<Recruitment>("recruitment");
  },
  async insert(data: CreateArg<Recruitment>): Promise<void> {
    const collection = await this.getCollection();
    collection.insertOne(createDocument(data));
  },
};

export const applicationRepository = {
  getCollection(): Promise<Collection<Application>> {
    return db.getCollection<Application>("application");
  },
  async insert(data: CreateArg<Application>): Promise<void> {
    const collection = await this.getCollection();
    collection.insertOne(createDocument({
      ...data,
      deletedAt: null,
    }));
  },
  // 申請をキャンセルする。内部的には論理削除
  async cancel(discordUserId: string) {
    const collection = await this.getCollection();
    const user = await userQueryService.findByDiscordId(discordUserId);
    if (!user) {
      throw new Error("cancel user not found");
    }
    collection.updateOne(
      (application) => application.userId === user.id,
      updateDocument<Application>({ deletedAt: new Date() }),
    );
  },
};

export const recruitmentLogRepository = {
  getCollection(): Promise<Collection<RecruitmentLog>> {
    return db.getCollection<RecruitmentLog>("recruitmentLog");
  },
  async insert(data: CreateArg<RecruitmentLog>): Promise<void> {
    const collection = await this.getCollection();
    collection.insertOne(createDocument(data));
  },
};
