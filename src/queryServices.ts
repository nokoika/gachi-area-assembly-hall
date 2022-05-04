import { db } from "./filedbClient.ts";
import { User } from "./entities.ts";
import { Collection } from "./deps/filedb.ts";

export const userQueryService = {
  getCollection(): Promise<Collection<User>> {
    return db.getCollection<User>("users");
  },
  async findByDiscordId(id: bigint): Promise<User | undefined> {
    const collection = await this.getCollection();
    // ライブラリの型がおかしいが、1件も見つからなかったらundefinedが返却されると思う
    return collection.findOne((user) => BigInt(user.discordUserId) === id);
  },
};
