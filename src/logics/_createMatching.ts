import { ApplicationType } from "../constants.ts";
import { Application, Recruitment, RecruitmentLog, User } from "../entities.ts";
import { CreateArg, UUID } from "../utils/document.ts";

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
  roomSize: number,
  getRandomIndex: (ary: unknown[]) => number,
  sortByUdemae: (users: User[]) => User[],
): CreateArg<RecruitmentLog> => {
  if (applications.length !== users.length) {
    throw new Error("invalid application and user pair.");
  }

  const roomCount = applications.length / roomSize | 0;
  const usersClone = users.concat();
  const remainderCount = usersClone.length % roomSize;

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
    for (let j = 0; j < roomSize; j++) {
      players.push(usersSorted[j + i * roomSize]);
    }
    roomList.push(players);
  }

  const rooms = roomList.map((room) => {
    // 初見は基本親にならない
    const excludeFirstLook = room.filter((user) => user.participationCount > 0);
    const targets = excludeFirstLook.length > 0 ? excludeFirstLook : room;
    const randomIdx = getRandomIndex(targets);
    const host = targets[randomIdx];
    return {
      players: room,
      backPlayers: filterBackPlayers(room, applications),
      host,
    };
  });

  return { recruitment, applications, rooms, remainders };
};
