import { AreaSchedule } from "./entities.ts";

const endpoint = "https://spla2.yuu26.com/schedule";

type ResponseBody = {
  result: {
    gachi: Array<{
      rule: "ガチエリア" | "ガチホコバトル" | "ガチヤグラ" | "ガチアサリ";
      rule_ex: {
        key: "splat_zones" | "rainmaker" | "tower_control" | "clam_blitz";
        name: "ガチエリア" | "ガチホコバトル" | "ガチヤグラ" | "ガチアサリ";
      };
      maps: string[];
      maps_ex: Array<{
        id: number;
        name: string;
        image: string;
      }>;
      start: string;
      start_utc: string;
      start_t: number;
      end: string;
      end_utc: string;
      end_t: number;
    }>;
  };
};

export const fetchAreaSchedule = async (): Promise<AreaSchedule[]> => {
  const res = await fetch(endpoint);
  if (res.status !== 200) {
    throw new Error("schedule fetch failed");
  }
  // 現在を含む、24時間分のデータが入っている
  const data = await res.json() as ResponseBody;
  const areaSchedules = data.result.gachi
    .filter((schedule) => schedule.rule === "ガチエリア")
    .map((schedule) => ({
      maps: schedule.maps,
      start: new Date(schedule.start_utc),
      end: new Date(schedule.end_utc),
    }));
  return areaSchedules;
};
