type Document<T extends Record<string, unknown>> = {
  // id: string; 面倒なので必要になったらIDを追加しよう。。。
  createdAt: Date;
  updatedAt: Date;
} & T;

export type User = Document<{
  discordUserId: string; // DB 的に bigint が扱えるか不明なので文字列で保存する
  friendCode: string;
}>;
