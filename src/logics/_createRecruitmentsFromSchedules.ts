import { RecruitingType } from "../constants.ts";
import { AreaSchedule, Recruitment } from "../entities.ts";
import dayjs from "../deps/dayjs.ts";
import { CreateArg } from "../utils/document.ts";
import { isRecent, today } from "../utils/date.ts";
import { getCurrentMonthStages } from "../getCurrentMonthStages.ts";

const createPreparationRecruitment = (
  willStartAt: dayjs.Dayjs,
  stages: string[],
): CreateArg<Recruitment> => {
  return {
    type: RecruitingType.Preparation,
    stages,
    willStartAt: willStartAt.toDate(),
  };
};

const createTrainingRecruitment = (
  willStartAt: dayjs.ConfigType,
  today: dayjs.ConfigType,
): CreateArg<Recruitment> => {
  return {
    type: RecruitingType.Training,
    stages: getCurrentMonthStages(today),
    willStartAt: dayjs(willStartAt).toDate(),
  };
};

// ・トレーニングマッチは9,10,11時に開催
// ・0次会はエリア開催の1時間前に開催
// ・0次会の開催時刻は昼の12時から24時のみ
// ・エリア開催中はトレーニングマッチは開催しない
export const _createRecruitmentsFromSchedules = (
  areaSchedules: AreaSchedule[],
  today: dayjs.ConfigType,
): CreateArg<Recruitment>[] => {
  const preparationRecruitments = areaSchedules.filter((s) => {
    const openingTime = dayjs(today).hour(12);
    const closingTime = dayjs(today).hour(2).add(1, "d");
    return openingTime.isBefore(s.start) && closingTime.isAfter(s.start);
  }).map((s) => {
    const willStartAt = dayjs(s.start).subtract(1, "h");
    return createPreparationRecruitment(willStartAt, s.maps);
  });
  const possibleTrainings = [21, 22, 23].map((h) => dayjs(today).hour(h));
  const trainingRecruitments: CreateArg<Recruitment>[] = possibleTrainings
    // 0次会と重複するものを除外
    .filter((d) => {
      return preparationRecruitments.every((r) => !isRecent(r.willStartAt, d));
    })
    // ガチエリア開催時間のものを除外
    .filter((d) => {
      return areaSchedules.every((s) => {
        return d.isBefore(s.start) || d.isAfter(s.end) || d.isSame(s.end);
      });
    })
    .map((willStartAt) => createTrainingRecruitment(willStartAt, today));
  const merged = [...preparationRecruitments, ...trainingRecruitments]
    // 昇順
    .sort((a, b) => {
      return a.willStartAt.getTime() - b.willStartAt.getTime();
    });
  return merged;
};

const toDayjs = (hour: number): dayjs.Dayjs =>
  today().hour(hour).minute(0).second(0).millisecond(0);

// モックは動作確認用に、毎時ルールが変わる、かつ常にエリアということにする。
// 4~27時
export const createRecruitmentsFromSchedulesMock = (): CreateArg<
  Recruitment
>[] => {
  return Array
    .from({ length: 24 }, (_, i) => i + 4)
    .map((h) =>
      Math.random() < 0.5
        ? createTrainingRecruitment(toDayjs(h), today())
        : createPreparationRecruitment(toDayjs(h), ["s1", "s2"])
    );
};
