import { assertEquals } from "../deps/std.ts";
import { RecruitingType } from "../constants.ts";
import { _createRecruitmentsFromSchedules } from "./_createRecruitmentsFromSchedules.ts";

const mayStages = [
  "フジツボスポーツクラブ",
  "チョウザメ造船",
  "タチウオパーキング",
  "ホッケふ頭",
  "ザトウマーケット",
  "アジフライスタジアム",
  "ショッツル鉱山",
  "ムツゴ楼",
];

Deno.test("schedule logic case 1", () => {
  const today = new Date("2022-05-08T11:00:00.000+0900");
  const areaSchedules = [
    {
      maps: ["stage1", "stage2"],
      start: new Date("2022-05-08T15:00:00.000+0900"),
      end: new Date("2022-05-08T17:00:00.000+0900"),
    },
    {
      maps: ["stage3", "stage4"],
      start: new Date("2022-05-08T19:00:00.000+0900"),
      end: new Date("2022-05-08T21:00:00.000+0900"),
    },
  ];
  const recruitments = _createRecruitmentsFromSchedules(areaSchedules, today);

  assertEquals(recruitments[0].stages, ["stage1", "stage2"]);
  assertEquals(recruitments[0].type, RecruitingType.Preparation);
  assertEquals(
    recruitments[0].willStartAt,
    new Date("2022-05-08T14:00:00.000+0900"),
  );

  assertEquals(recruitments[1].stages, ["stage3", "stage4"]);
  assertEquals(recruitments[1].type, RecruitingType.Preparation);
  assertEquals(
    recruitments[1].willStartAt,
    new Date("2022-05-08T18:00:00.000+0900"),
  );

  assertEquals(recruitments[2].stages, mayStages);
  assertEquals(recruitments[2].type, RecruitingType.Training);
  assertEquals(
    recruitments[2].willStartAt,
    new Date("2022-05-08T21:00:00.000+0900"),
  );

  assertEquals(recruitments[3].stages, mayStages);
  assertEquals(recruitments[3].type, RecruitingType.Training);
  assertEquals(
    recruitments[3].willStartAt,
    new Date("2022-05-08T22:00:00.000+0900"),
  );

  assertEquals(recruitments[4].stages, mayStages);
  assertEquals(recruitments[4].type, RecruitingType.Training);
  assertEquals(
    recruitments[4].willStartAt,
    new Date("2022-05-08T23:00:00.000+0900"),
  );

  assertEquals(recruitments.length, 5);
});

Deno.test("schedule logic case 2", () => {
  const today = new Date("2022-05-08T11:00:00.000+0900");
  const areaSchedules = [
    {
      maps: ["stage1", "stage2"],
      start: new Date("2022-05-08T05:00:00.000+0900"),
      end: new Date("2022-05-08T07:00:00.000+0900"),
    },
    {
      maps: ["stage3", "stage4"],
      start: new Date("2022-05-08T11:00:00.000+0900"),
      end: new Date("2022-05-08T13:00:00.000+0900"),
    },
    {
      maps: ["stage5", "stage6"],
      start: new Date("2022-05-08T21:00:00.000+0900"),
      end: new Date("2022-05-08T23:00:00.000+0900"),
    },
    {
      maps: ["stage7", "stage8"],
      start: new Date("2022-05-09T01:00:00.000+0900"),
      end: new Date("2022-05-09T03:00:00.000+0900"),
    },
    {
      maps: ["stage9", "stage10"],
      start: new Date("2022-05-09T05:00:00.000+0900"),
      end: new Date("2022-05-09T07:00:00.000+0900"),
    },
  ];
  const recruitments = _createRecruitmentsFromSchedules(areaSchedules, today);

  assertEquals(recruitments[0].stages, ["stage5", "stage6"]);
  assertEquals(recruitments[0].type, RecruitingType.Preparation);
  assertEquals(
    recruitments[0].willStartAt,
    new Date("2022-05-08T20:00:00.000+0900"),
  );

  assertEquals(recruitments[1].stages, mayStages);
  assertEquals(recruitments[1].type, RecruitingType.Training);
  assertEquals(
    recruitments[1].willStartAt,
    new Date("2022-05-08T23:00:00.000+0900"),
  );

  assertEquals(recruitments[2].stages, ["stage7", "stage8"]);
  assertEquals(recruitments[2].type, RecruitingType.Preparation);
  assertEquals(
    recruitments[2].willStartAt,
    new Date("2022-05-09T00:00:00.000+0900"),
  );

  assertEquals(recruitments.length, 3);
});

Deno.test("schedule logic case 3", () => {
  const today = new Date("2022-05-08T11:00:00.000+0900");
  const areaSchedules = [
    {
      maps: ["stage1", "stage2"],
      start: new Date("2022-05-08T13:00:00.000+0900"),
      end: new Date("2022-05-08T15:00:00.000+0900"),
    },
    {
      maps: ["stage3", "stage4"],
      start: new Date("2022-05-08T23:00:00.000+0900"),
      end: new Date("2022-05-09T01:00:00.000+0900"),
    },
    {
      maps: ["stage5", "stage6"],
      start: new Date("2022-05-09T03:00:00.000+0900"),
      end: new Date("2022-05-09T05:00:00.000+0900"),
    },
  ];
  const recruitments = _createRecruitmentsFromSchedules(areaSchedules, today);

  assertEquals(recruitments[0].stages, ["stage1", "stage2"]);
  assertEquals(recruitments[0].type, RecruitingType.Preparation);
  assertEquals(
    recruitments[0].willStartAt,
    new Date("2022-05-08T12:00:00.000+0900"),
  );

  assertEquals(recruitments[1].stages, mayStages);
  assertEquals(recruitments[1].type, RecruitingType.Training);
  assertEquals(
    recruitments[1].willStartAt,
    new Date("2022-05-08T21:00:00.000+0900"),
  );

  assertEquals(recruitments[2].stages, ["stage3", "stage4"]);
  assertEquals(recruitments[2].type, RecruitingType.Preparation);
  assertEquals(
    recruitments[2].willStartAt,
    new Date("2022-05-08T22:00:00.000+0900"),
  );

  assertEquals(recruitments.length, 3);
});
