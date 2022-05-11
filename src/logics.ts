import { ApplicationType, RecruitingType } from "./constants.ts";
import {
  Application,
  AreaSchedule,
  Recruitment,
  RecruitmentLog,
  User,
} from "./entities.ts";
import dayjs from "./deps/dayjs.ts";
import { CreateArg, UUID } from "./utils/document.ts";
import { isRecent } from "./utils/date.ts";
import { getCurrentMonthStages } from "./getCurrentMonthStages.ts";

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
export const createRecruitmentsFromSchedules = (
  areaSchedules: AreaSchedule[],
  today: dayjs.ConfigType,
): CreateArg<Recruitment>[] => {
  const preparationRecruitments = areaSchedules.filter((s) => {
    const openingTime = dayjs(today).hour(12);
    const closingTime = dayjs(today).hour(26);
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

export const _sortByUdemae = (
  users: User[],
  getRandomFromUserId: (id: UUID) => number,
): User[] => {
  const randomCache: Record<UUID, number> = Object.fromEntries(
    users.map((u) => [u.id, getRandomFromUserId(u.id)]),
  );
  const comparison = (a: User, b: User): number => {
    if (!a.udemae || !b.udemae) {
      // 参加に必須なのでウデマエは設定されているはず
      throw new Error("There are unregistered users of Udemae");
    }
    // 降順
    const diff = b.udemae - a.udemae;
    if (diff !== 0) return diff;
    // ウデマエが同じなら、ユーザーごとに設定したランダムな値で順序を決める (ランダムな部分は昇順)
    return randomCache[a.id] - randomCache[b.id];
  };
  return users.concat().sort(comparison);
};

export const _createMatching = (
  recruitment: Recruitment,
  applications: Application[],
  users: User[],
  getRandomIndex: (ary: unknown[]) => number,
  sortByUdemae: (users: User[]) => User[],
): CreateArg<RecruitmentLog> => {
  const roomCount = applications.length / 8 | 0;
  const usersClone = users.concat();
  const remainderCount = usersClone.length % 8;

  const remainders = [];
  for (let i = 0; i < remainderCount; i++) {
    const randomIdx = getRandomIndex(usersClone);
    const [remainder] = usersClone.splice(randomIdx, 1);
    remainders.push(remainder);
  }

  const usersSorted = sortByUdemae(usersClone);

  // 8人ごとの部屋を複数つくる
  const roomList: User[][] = [];
  for (let i = 0; i < roomCount; i++) {
    const players = [];
    for (let j = 0; j < 8; j++) {
      players.push(usersSorted[j + i * 8]);
    }
    roomList.push(players);
  }

  const rooms = roomList.map((room, i) => {
    // 初見は基本親にならない
    const excludeFirstLook = room.filter((user) => user.participationCount > 0);
    const targets = excludeFirstLook.length > 0 ? excludeFirstLook : room;
    const randomIdx = getRandomIndex(targets);
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

export const createMatching = (
  recruitment: Recruitment,
  applications: Application[],
  users: User[],
): CreateArg<RecruitmentLog> => {
  const getRandomIndex = (ary: unknown[]): number => {
    return Math.floor(Math.random() * ary.length);
  };
  const getRandomFromUserId = (_: UUID): number => {
    return Math.random();
  };

  // _ から始まる関数は本来乱数に依存する機能だが、乱数の決定を外部に置くことで
  // テスト可能な関数にしている
  const sortByUdemae = (users: User[]): User[] => {
    return _sortByUdemae(users, getRandomFromUserId);
  };
  return _createMatching(
    recruitment,
    applications,
    users,
    getRandomIndex,
    sortByUdemae,
  );
};
