import { RecruitingType, Udemae } from "./constants.ts";
import { discordEnv } from "./env.ts";

export const getRecruitingChannel = (type: RecruitingType): bigint => {
  const o = {
    [RecruitingType.Preparation]: discordEnv.channelIds.preparationMatch,
    [RecruitingType.Training]: discordEnv.channelIds.trainingMatch,
  };
  return o[type];
};

export const getUdemaeFromRole = (roleIds: bigint[]): Udemae | undefined => {
  const list: Array<[Udemae, bigint]> = [
    [Udemae.X2300, discordEnv.roles.x2300],
    [Udemae.X2400, discordEnv.roles.x2400],
    [Udemae.X2500, discordEnv.roles.x2500],
    [Udemae.X2600, discordEnv.roles.x2600],
    [Udemae.X2700, discordEnv.roles.x2700],
    [Udemae.X2800, discordEnv.roles.x2800],
    [Udemae.X2900, discordEnv.roles.x2900],
    [Udemae.X3000, discordEnv.roles.x3000],
    [Udemae.X3100, discordEnv.roles.x3100],
  ];
  return list.find(([_udemae, roleId]) => roleIds.includes(roleId))?.[0];
};
