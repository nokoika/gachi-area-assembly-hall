import { Application, Recruitment, RecruitmentLog, User } from "../entities.ts";
import { CreateArg, UUID } from "../utils/document.ts";
import { discordEnv } from "../env.ts";
import { _createMatching, _sortByUdemae } from "./_createMatching.ts";

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

  // 乱数の決定を外部に置くことでテスト可能な関数にしている
  const sortByUdemae = (users: User[]): User[] => {
    return _sortByUdemae(users, getRandomFromUserId);
  };
  return _createMatching(
    recruitment,
    applications,
    users,
    discordEnv.roomSize, // UTはenvに依存したくないので外部から注入している
    getRandomIndex,
    sortByUdemae,
  );
};
