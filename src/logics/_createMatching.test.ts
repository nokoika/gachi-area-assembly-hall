import { assertEquals } from "../deps/std.ts";
import { ApplicationType, RecruitingType, Udemae } from "../constants.ts";
import { Application, Recruitment, User } from "../entities.ts";
import { UUID } from "../utils/document.ts";
import { _createMatching, _sortByUdemae } from "./_createMatching.ts";

// 以下、_createMatching をテストする用の Utility

const createDocument = (id: string) => {
  return {
    id: id as UUID,
    // 面倒なので引数をomitしてないが、このロジックでは日付は全く使わないので適当でよい。
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

const createRecruitment = (): Recruitment => {
  return {
    ...createDocument("r1"),
    type: RecruitingType.Preparation,
    stages: ["s1", "s2"],
    willStartAt: new Date(),
  };
};

const createApplication = (type: ApplicationType, i: number): Application => {
  return {
    ...createDocument("a" + (i + 1)),
    recruitmentId: "r1" as UUID,
    userId: "u" + (i + 1) as UUID,
    type,
    deletedAt: null,
  };
};
const createUser = (userAttr: [Udemae, number], i: number) => {
  return {
    ...createDocument("u" + (i + 1)),
    discordUserId: "du" + (i + 1),
    friendCode: "fc" + (i + 1),
    udemae: userAttr[0],
    participationCount: userAttr[1],
  };
};

// 重複チェック
const hasDuplicationByKey = (
  keys: Array<string | number | bigint | UUID>,
): boolean => {
  const setElements = new Set(keys);
  return setElements.size !== keys.length;
};

const hasDuplicationByDocumentId = (xs: Array<{ id: UUID }>): boolean => {
  return hasDuplicationByKey(xs.map((x) => x.id));
};

const createRandomPicker = (randoms: number[]) => {
  let i = 0;
  const getRandomIndex = () => {
    return randoms[i++];
  };
  return getRandomIndex;
};

// テスト用の場合、同じウデマエの人同士の順序は入れ替えない
const sortByUdemaeForTest = (users: User[]): User[] => {
  return users.concat().sort((a, b) => b.udemae! - a.udemae!);
};

Deno.test("_sortByUdemae 全員同じウデマエなら、ランダムの値をもとに昇順", () => {
  const userAttrs: Array<[Udemae, number]> = [
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
  ];
  const users: User[] = userAttrs.map(createUser);
  const result = _sortByUdemae(users, (id) => {
    return ({
      "u1": 4,
      "u2": 2,
      "u3": 5,
      "u4": 1,
      "u5": 3,
    })[id as string]!;
  });
  assertEquals(result.length, 5);
  assertEquals(result[0].id, "u4");
  assertEquals(result[1].id, "u2");
  assertEquals(result[2].id, "u5");
  assertEquals(result[3].id, "u1");
  assertEquals(result[4].id, "u3");
});

Deno.test("_sortByUdemae 全員ウデマエが違えば、ウデマエをもとに降順", () => {
  const userAttrs: Array<[Udemae, number]> = [
    [Udemae.X2900, 1],
    [Udemae.X2400, 1],
    [Udemae.X2700, 1],
    [Udemae.X2300, 1],
    [Udemae.X2500, 1],
  ];
  const users: User[] = userAttrs.map(createUser);
  const result = _sortByUdemae(users, (id) => {
    return ({
      "u1": 1,
      "u2": 2,
      "u3": 3,
      "u4": 4,
      "u5": 5,
    })[id as string]!;
  });
  assertEquals(result.length, 5);
  assertEquals(result[0].id, "u1");
  assertEquals(result[1].id, "u3");
  assertEquals(result[2].id, "u5");
  assertEquals(result[3].id, "u2");
  assertEquals(result[4].id, "u4");
});

Deno.test("_sortByUdemae 一部ウデマエが同じ", () => {
  const userAttrs: Array<[Udemae, number]> = [
    [Udemae.X2300, 1],
    [Udemae.X2500, 1],
    [Udemae.X2600, 1],
    [Udemae.X2500, 1],
    [Udemae.X2400, 1],
    [Udemae.X2600, 1],
  ];
  const users: User[] = userAttrs.map(createUser);
  const result = _sortByUdemae(users, (id) => {
    return ({
      "u1": 3,
      "u2": 2,
      "u3": 6,
      "u4": 4,
      "u5": 5,
      "u6": 1,
    })[id as string]!;
  });
  assertEquals(result.length, 6);
  assertEquals(result[0].id, "u6");
  assertEquals(result[1].id, "u3");
  assertEquals(result[2].id, "u2");
  assertEquals(result[3].id, "u4");
  assertEquals(result[4].id, "u5");
  assertEquals(result[5].id, "u1");
});

Deno.test("_createMatching 10人のときに1部屋できる", () => {
  const recruitment = createRecruitment();
  const applications: Application[] = [
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,
    ApplicationType.ApplyFrontPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
  ].map(createApplication);

  const userAttrs: Array<[Udemae, number]> = [
    [Udemae.X2400, 1],
    [Udemae.X2400, 2],
    [Udemae.X2400, 3],
    [Udemae.X2400, 4], // 親

    [Udemae.X2400, 5],
    [Udemae.X2400, 6],
    [Udemae.X2400, 7],
    [Udemae.X2400, 8],

    [Udemae.X2400, 9], // あまり
    [Udemae.X2400, 10], // あまり
  ];
  const users: User[] = userAttrs.map(createUser);

  const getRandomIndex = createRandomPicker([
    9, // あまり選択
    8, // あまり選択
    3, // 親選択
  ]);

  const matching = _createMatching(
    recruitment,
    applications,
    users,
    8,
    getRandomIndex,
    sortByUdemaeForTest,
  );

  assertEquals(matching.remainders.length, 2);
  assertEquals(matching.remainders[0].id, "u10");
  assertEquals(matching.remainders[1].id, "u9");
  assertEquals(matching.rooms.length, 1);
  assertEquals(matching.rooms[0].host.id, "u4");
  assertEquals(matching.rooms[0].players.length, 8);
  assertEquals(matching.rooms[0].backPlayers.length, 2);
  assertEquals(
    hasDuplicationByDocumentId(matching.rooms[0].players),
    false,
  );
  assertEquals(
    hasDuplicationByDocumentId(matching.rooms[0].backPlayers),
    false,
  );
  assertEquals(hasDuplicationByDocumentId(matching.remainders), false);
});

Deno.test("_createMatching 26人3部屋", () => {
  const recruitment = createRecruitment();
  const applications: Application[] = [
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,
    ApplicationType.ApplyBackPlayer,

    ApplicationType.ApplyFrontPlayer, // あまり

    ApplicationType.ApplyBackPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer, // あまり
    ApplicationType.ApplyBackPlayer,
    ApplicationType.ApplyFrontPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,
  ].map(createApplication);

  const userAttrs: Array<[Udemae, number]> = [
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],

    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],

    [Udemae.X2400, 1], // あまり

    [Udemae.X2400, 1],
    [Udemae.X2300, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],

    [Udemae.X2400, 1],
    [Udemae.X2800, 1],
    [Udemae.X2400, 1], // あまり
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],

    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],

    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
    [Udemae.X2400, 1],
  ];
  const users: User[] = userAttrs.map(createUser);
  const getRandomIndex = createRandomPicker([
    8, // あまり選択
    15 - 1, // あまり選択 (↑でspliceしているので-1ずれる)
    6, // 親選択
    0, // 親選択
    7, // 親選択
  ]);

  const matching = _createMatching(
    recruitment,
    applications,
    users,
    8,
    getRandomIndex,
    sortByUdemaeForTest,
  );

  assertEquals(matching.rooms.length, 3);
  assertEquals(matching.remainders[0].id, "u9");
  assertEquals(matching.remainders[1].id, "u16");
  assertEquals(matching.rooms[0].players.length, 8);
  assertEquals(matching.rooms[1].players.length, 8);
  assertEquals(matching.rooms[2].players.length, 8);
  assertEquals(matching.rooms[0].backPlayers.length, 2); // 全員同じウデマエなら3だが、28がいるためずれる
  assertEquals(matching.rooms[1].backPlayers.length, 4);
  assertEquals(matching.rooms[2].backPlayers.length, 3);
  assertEquals(matching.rooms[0].alpha.length, 1);
  assertEquals(matching.rooms[0].bravo.length, 1);
  assertEquals(matching.rooms[1].alpha.length, 2);
  assertEquals(matching.rooms[1].bravo.length, 2);
  assertEquals(matching.rooms[2].alpha.length, 1);
  assertEquals(matching.rooms[2].bravo.length, 1);
  assertEquals(matching.rooms[0].players[0].id, "u15"); // 先頭2800
  assertEquals(matching.rooms[2].players[7].id, "u11"); // 末尾2300
  assertEquals(matching.rooms[0].host.id, "u6"); // 全員同じウデマエならu7だが、28がいるためずれる
  assertEquals(matching.rooms[1].host.id, "u8"); // 28がいるためずれる
  assertEquals(matching.rooms[2].host.id, "u11"); // 末尾選択。2300が一番後ろにいる
  assertEquals(
    hasDuplicationByDocumentId([
      ...matching.rooms[0].players,
      ...matching.rooms[1].players,
      ...matching.rooms[2].players,
    ]),
    false,
  );
  assertEquals(
    hasDuplicationByDocumentId([
      ...matching.rooms[0].backPlayers,
      ...matching.rooms[1].backPlayers,
      ...matching.rooms[2].backPlayers,
    ]),
    false,
  );
  assertEquals(
    hasDuplicationByDocumentId([
      ...matching.rooms[0].alpha,
      ...matching.rooms[0].bravo,
      ...matching.rooms[1].alpha,
      ...matching.rooms[1].bravo,
      ...matching.rooms[2].alpha,
      ...matching.rooms[2].bravo,
    ]),
    false,
  );
  assertEquals(hasDuplicationByDocumentId(matching.remainders), false);
});

Deno.test("_createMatching 7人のときは1部屋もできない", () => {
  const recruitment = createRecruitment();
  const applications: Application[] = [
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,
  ].map(createApplication);

  const userAttrs: Array<[Udemae, number]> = [
    [Udemae.X2400, 1],
    [Udemae.X2400, 2],
    [Udemae.X2400, 3],
    [Udemae.X2400, 4],

    [Udemae.X2400, 5],
    [Udemae.X2400, 6],
    [Udemae.X2400, 7],
  ];
  const users: User[] = userAttrs.map(createUser);

  const getRandomIndex = createRandomPicker([
    0, // あまり選択
    0, // あまり選択
    0, // あまり選択
    0, // あまり選択
    0, // あまり選択
    0, // あまり選択
    0, // あまり選択
  ]);

  const matching = _createMatching(
    recruitment,
    applications,
    users,
    8,
    getRandomIndex,
    sortByUdemaeForTest,
  );

  assertEquals(matching.rooms.length, 0);
  assertEquals(matching.remainders.length, 7);
  assertEquals(hasDuplicationByDocumentId(matching.remainders), false);
});

Deno.test("_createMatching 8人中4人が初見。初見さんはホストにしない", () => {
  const recruitment = createRecruitment();
  const applications: Application[] = [
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,
    ApplicationType.ApplyFrontPlayer,
  ].map(createApplication);

  const userAttrs: Array<[Udemae, number]> = [
    [Udemae.X2400, 1],
    [Udemae.X2400, 0],
    [Udemae.X2400, 0],
    [Udemae.X2400, 1],

    [Udemae.X2400, 0],
    [Udemae.X2400, 1], // 親
    [Udemae.X2400, 0],
    [Udemae.X2400, 1],
  ];
  const users: User[] = userAttrs.map(createUser);

  const getRandomIndex = createRandomPicker([
    2, // 親選択
  ]);

  const matching = _createMatching(
    recruitment,
    applications,
    users,
    8,
    getRandomIndex,
    sortByUdemaeForTest,
  );

  assertEquals(matching.remainders.length, 0);
  assertEquals(matching.rooms.length, 1);
  assertEquals(matching.rooms[0].host.id, "u6");
  assertEquals(matching.rooms[0].players.length, 8);
  assertEquals(
    hasDuplicationByDocumentId(matching.rooms[0].players),
    false,
  );
});

Deno.test("_createMatching 全員が初見。ランダムにホストを決定する", () => {
  const recruitment = createRecruitment();
  const applications: Application[] = [
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,

    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyFrontPlayer,
    ApplicationType.ApplyBackPlayer,
    ApplicationType.ApplyFrontPlayer,
  ].map(createApplication);

  const userAttrs: Array<[Udemae, number]> = [
    [Udemae.X2400, 0],
    [Udemae.X2400, 0],
    [Udemae.X2400, 0],
    [Udemae.X2400, 0], // 親

    [Udemae.X2400, 0],
    [Udemae.X2400, 0],
    [Udemae.X2400, 0],
    [Udemae.X2400, 0],
  ];
  const users: User[] = userAttrs.map(createUser);

  const getRandomIndex = createRandomPicker([
    3, // 親選択
  ]);

  const matching = _createMatching(
    recruitment,
    applications,
    users,
    8,
    getRandomIndex,
    sortByUdemaeForTest,
  );

  assertEquals(matching.remainders.length, 0);
  assertEquals(matching.rooms[0].host.id, "u4");
  assertEquals(matching.rooms[0].players.length, 8);
});
