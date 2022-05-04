import { db } from "./filedbClient.ts";
import { User } from "./entities.ts";
import { Collection } from "./deps/filedb.ts";
import { userQueryService } from "./queryServices.ts";

export const userRepository = {
  getCollection(): Promise<Collection<User>> {
    return db.getCollection<User>("users");
  },
  async upsertUser(discordUserId: bigint, friendCode: string): Promise<void> {
    const collection = await this.getCollection();
    // transaction してないが競合は発生しないはず
    const user = await userQueryService.findByDiscordId(discordUserId);
    if (user) {
      collection.updateOne(
        (user) => BigInt(user.discordUserId) === discordUserId,
        (user) => ({
          ...user,
          friendCode,
          updatedAt: new Date(),
        }),
      );
    } else {
      collection.insertOne({
        discordUserId: discordUserId.toString(),
        friendCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  },
};
