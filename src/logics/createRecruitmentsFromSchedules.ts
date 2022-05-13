import { AreaSchedule, Recruitment } from "../entities.ts";
import { discordEnv } from "../env.ts";
import { today } from "../utils/date.ts";
import { CreateArg } from "../utils/document.ts";
import {
  _createRecruitmentsFromSchedules,
  createRecruitmentsFromSchedulesMock,
} from "./_createRecruitmentsFromSchedules.ts";

export const createRecruitmentsFromSchedules = (
  areaSchedules: AreaSchedule[],
): CreateArg<Recruitment>[] => {
  return discordEnv.useScheduleMock
    ? createRecruitmentsFromSchedulesMock()
    : _createRecruitmentsFromSchedules(areaSchedules, today());
};
