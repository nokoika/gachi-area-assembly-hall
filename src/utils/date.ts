import dayjs from "../deps/dayjs.ts";

// ※本日であるというのは「当日の4:00~27:59」であると定義する
// ex: 1/1 4:00 → 1/1 扱い
// ex: 1/1 3:00 → 12/31 扱い
// ex: 1/1 0:00 → 12/31 扱い
// ex: 1/1 23:59 → 1/1 扱い

// 本日の日付を返却 (時間は4時(始点)、分秒は0)
export const today = (): dayjs.Dayjs => {
  if (dayjs().hour() < 4) {
    // 1日前を返却
    return dayjs().subtract(1, "d").hour(4).minute(0).second(0).millisecond(0);
  }
  return dayjs().hour(4).minute(0).second(0).millisecond(0);
};

// 対象の日付が本日であるかどうか
export const isToday = (
  date: dayjs.ConfigType,
  current: dayjs.ConfigType = today(),
): boolean => {
  const [d, c] = [date, current].map((v) => dayjs(v));
  const template = "YYYY-MM-DD";
  // d.hour() は必ず 0-23
  if (d.hour() >= 4) {
    return d.tz().format(template) === c.tz().format(template);
  } else {
    return d.tz().format(template) === c.add(1, "d").tz().format(template);
  }
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
