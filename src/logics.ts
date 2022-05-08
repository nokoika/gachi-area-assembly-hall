import { ApplicationType, RecruitingType } from "./constants.ts";
import {
  Application,
  AreaSchedule,
  Recruitment,
  RecruitmentLog,
  User,
} from "./entities.ts";
import dayjs from "./deps/dayjs.ts";
import { CreateArg } from "./utils/document.ts";
import { isRecent, today } from "./utils/date.ts";

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
  willStartAt: dayjs.Dayjs,
): CreateArg<Recruitment> => {
  return {
    type: RecruitingType.Training,
    stages: [],
    willStartAt: willStartAt.toDate(),
  };
};

// トレーニングマッチは9,10,11時に開催。0次会はエリア開催の1時間前に開催。エリア開催中はトレーニングマッチは開催しない
// TODO: UT
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

const filterBackPlayers = (
  users: User[],
  applications: Application[],
): User[] => {
  return users.filter((u) => {
    const application = applications.find((a) => a.userId === u.id);
    if (!application) throw new Error("application not found");
    return application.type === ApplicationType.ApplyBackPlayer;
  });
};

// TODO: UT
export const createMatching = (
  recruitment: Recruitment,
  applications: Application[],
  users: User[],
): CreateArg<RecruitmentLog> => {
  const roomCount = applications.length / 8 | 0;
  // 降順。参加に必須なのでウデマエは設定されているはず
  const sorted = users.concat().sort((a, b) => b.udemae! - a.udemae!);
  const remainderCount = sorted.length % 8;

  const remainders = [];
  for (let i = 0; i < remainderCount; i++) {
    // lengthは変動
    const randomIdx = Math.floor(Math.random() * sorted.length);
    const [remainder] = sorted.splice(randomIdx, 1);
    remainders.push(remainder);
  }

  // 8人ごとの部屋を複数つくる
  const roomList: User[][] = [];
  for (let i = 0; i < roomCount; i++) {
    const players = [];
    for (let j = 0; j < 8; j++) {
      players.push(sorted[j + i * 8]);
    }
    roomList.push(players);
  }

  const rooms = roomList.map((room, i) => {
    // 初見は基本親にならない
    const excludeFirstLook = room.filter((user) => user.participationCount > 0);
    const targets = excludeFirstLook.length > 0 ? excludeFirstLook : room;
    const randomIdx = Math.floor(Math.random() * targets.length);
    const host = targets[randomIdx];
    return {
      textChannelIdx: i + 1,
      players: room,
      backPlayers: filterBackPlayers(room, applications),
      host,
    };
  });

  return { recruitment, applications, rooms, remainders };
};
