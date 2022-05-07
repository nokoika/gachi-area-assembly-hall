import { db } from "./filedbClient.ts";
import { Application, Recruitment, RecruitmentLog, User } from "./entities.ts";
import { Collection } from "./deps/filedb.ts";
import {
  CreateArg,
  createDocument,
  updateDocument,
  UUID,
} from "./utils/document.ts";
import { ApplicationType, Udemae } from "./constants.ts";
import {
  Bot,
  DiscordenoInteraction,
  InteractionResponseTypes,
} from "./deps/discordeno.ts";
import { withinDaysOf } from "./utils/date.ts";

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
  async insertMany(dataList: CreateArg<Recruitment>[]): Promise<void> {
    const collection = await this.getCollection();
    collection.insertMany(dataList.map(createDocument));
  },
};

export const applicationRepository = {
  getCollection(): Promise<Collection<Application>> {
    return db.getCollection<Application>("application");
  },
  async insert(data: CreateArg<Application>): Promise<void> {
    const collection = await this.getCollection();
    // TODO: 最低限、recruitmentIdにつきuserIdの重複チェックくらいしたほうがいいか？
    collection.insertOne(createDocument({
      ...data,
      deletedAt: null,
    }));
  },
  // 申請をキャンセルする。内部的には論理削除
  async cancel(userId: UUID, recruitmentId: UUID): Promise<void> {
    const collection = await this.getCollection();
    collection.updateOne(
      (application) =>
        application.recruitmentId === recruitmentId &&
        application.userId === userId && !application.deletedAt,
      updateDocument<Application>({ deletedAt: new Date() }),
    );
  },
  // 後衛枠かどうかを変更する
  async updateApplicationType(
    userId: UUID,
    recruitmentId: UUID,
    applicationType: ApplicationType,
  ): Promise<void> {
    const collection = await this.getCollection();
    collection.updateOne(
      (application) =>
        application.recruitmentId === recruitmentId &&
        application.userId === userId && !application.deletedAt,
      updateDocument<Application>({ applicationType }),
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

export const discordMessageRepository = {
  async deleteChannelMessages(bot: Bot, channelId: bigint): Promise<void> {
    // チャンネルの投稿を概ね削除する
    const messages = await bot.helpers.getMessages(channelId);
    const deletableMessageIds = messages
      // 14日経過したメッセージは削除することができないので、filterする。
      // 境界条件をちゃんと調査していないので適当に12日以内のものに限定する
      .filter((m) => withinDaysOf(m.timestamp, 12))
      .map((m) => m.id);
    // 2件未満だとbulkDeleteできない謎仕様なので、件数で分岐する
    if (deletableMessageIds.length >= 2) {
      await bot.helpers.deleteMessages(channelId, deletableMessageIds);
    } else if (deletableMessageIds.length === 1) {
      await bot.helpers.deleteMessage(channelId, deletableMessageIds[0]);
    }
  },
};

export const discordInteractionRepository = {
  async sendResponse(
    bot: Bot,
    interaction: DiscordenoInteraction,
    content: string,
  ): Promise<void> {
    await bot.helpers.sendInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionResponseTypes.ChannelMessageWithSource,
        private: true, // 返信は本人だけが確認できる
        data: { content },
      },
    );
  },
};
