import { MatchType } from "./constants.ts";
import { AreaSchedule, Recruitment } from "./entities.ts";
import dayjs from "./deps/dayjs.ts";
import { CreateArg } from "./utils/document.ts";
import { isRecent, today } from "./utils/date.ts";

const createPreparationRecruitment = (
  willStartAt: dayjs.Dayjs,
  stages: string[],
): CreateArg<Recruitment> => {
  return {
    type: MatchType.Preparation,
    stages,
    willStartAt: willStartAt.toDate(),
  };
};

const createTrainingRecruitment = (
  willStartAt: dayjs.Dayjs,
): CreateArg<Recruitment> => {
  return {
    type: MatchType.Training,
    stages: [],
    willStartAt: willStartAt.toDate(),
  };
};

// トレーニングマッチは9,10,11時に開催。0次会はエリア開催の1時間前に開催。エリア開催中はトレーニングマッチは開催しない
export const createRecruitmentsFromSchedules = (
  areaSchedules: AreaSchedule[],
): CreateArg<Recruitment>[] => {
  const preparationRecruitments = areaSchedules.map((s) => {
    const willStartAt = dayjs(s.start).add(1, "h");
    return createPreparationRecruitment(willStartAt, s.maps);
  });
  const possibleTrainings = [9, 10, 11].map((h) => today().hour(h));
  const trainingRecruitments: CreateArg<Recruitment>[] = possibleTrainings
    // 0次会と重複するものを除外
    .filter((d) =>
      preparationRecruitments.find((r) => isRecent(r.willStartAt, d))
    )
    .map(createTrainingRecruitment);
  const merged = [...preparationRecruitments, ...trainingRecruitments]
    // 昇順
    .sort((a, b) =>
      a.willStartAt.getMilliseconds() - b.willStartAt.getMilliseconds()
    );
  return merged;
};

// export const createMatching = (
//   users: User[],
//   recrutment: Recruitment,
//   applications: Application[],
// ): RecruitmentLog => {
// };
