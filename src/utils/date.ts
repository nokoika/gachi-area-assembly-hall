import dayjs from "../deps/dayjs.ts";

// 本日の日付を返却 (時間分秒は0)
export const today = (): dayjs.Dayjs =>
  dayjs().hour(0).minute(0).second(0).millisecond(0);
