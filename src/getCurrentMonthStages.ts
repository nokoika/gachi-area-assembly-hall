import dayjs from "./deps/dayjs.ts";

export const getCurrentMonthStages = (today: dayjs.ConfigType): string[] => {
  // TODO: 毎年ステージは同じなので、後ほど一覧を作る
  const o: Record<number, string[]> = {
    4: [], // https://twitter.com/SplatoonJP/status/1509455539251597318/photo/1
    5: [ // https://twitter.com/SplatoonJP/status/1519621564324782000/photo/1
      "フジツボスポーツクラブ",
      "チョウザメ造船",
      "タチウオパーキング",
      "ホッケふ頭",
      "ザトウマーケット",
      "アジフライスタジアム",
      "ショッツル鉱山",
      "ムツゴ楼",
    ],
  };
  const thisMonth = dayjs(today).month() + 1; // month: 0-11
  return o[thisMonth];
};
