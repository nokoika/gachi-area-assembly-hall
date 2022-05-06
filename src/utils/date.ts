import dayjs from "../deps/dayjs.ts";

// 本日の日付を返却 (時間分秒は0)
export const today = (): dayjs.Dayjs =>
  dayjs().hour(0).minute(0).second(0).millisecond(0);

export const isToday = (date: Date | dayjs.Dayjs): boolean => {
  const d = dayjs(date);
  const current = today();
  return d.date() === current.date() &&
    d.month() === current.month() &&
    d.year() === current.year();
};

// 日付が最近のもの(30分以内)であるかどうか
export const isRecent = (
  date: Date | dayjs.Dayjs,
  comparison: Date | dayjs.Dayjs = dayjs(),
): boolean => {
  const d = dayjs(date);
  return Math.abs(d.diff(comparison, "m")) <= 30;
};
