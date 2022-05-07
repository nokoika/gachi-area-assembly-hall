import dayjs from "../deps/dayjs.ts";

// 本日の日付を返却 (時間分秒は0)
export const today = (): dayjs.Dayjs =>
  dayjs().hour(0).minute(0).second(0).millisecond(0);

// 対象の日付が本日であるかどうか (時間は無視)
export const isToday = (date: dayjs.ConfigType): boolean => {
  const d = dayjs(date);
  const current = today();
  return d.date() === current.date() &&
    d.month() === current.month() &&
    d.year() === current.year();
};

// 日付が最近のもの(30分以内)であるかどうか
export const isRecent = (
  date: dayjs.ConfigType,
  comparison: dayjs.ConfigType = dayjs(),
): boolean => {
  const d = dayjs(date);
  return Math.abs(d.diff(comparison, "m")) <= 30;
};

// 数日以内か
export const withinDaysOf = (
  date: dayjs.ConfigType,
  day: number,
): boolean => {
  return dayjs(date).add(day, "d").isAfter(dayjs());
};
