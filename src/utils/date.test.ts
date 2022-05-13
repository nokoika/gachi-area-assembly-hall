import { assertEquals } from "../deps/std.ts";
import { isRecent, isToday } from "./date.ts";

Deno.test("isRecent 10 minute => true", () => {
  assertEquals(
    isRecent(
      new Date("2022-05-09T03:00:00.000+0900"),
      new Date("2022-05-09T03:10:00.000+0900"),
    ),
    true,
  );
});

Deno.test("isRecent just 30 minute => true", () => {
  assertEquals(
    isRecent(
      new Date("2022-05-09T03:00:00.000+0900"),
      new Date("2022-05-09T03:30:00.000+0900"),
    ),
    true,
  );
});

Deno.test("isRecent 50 minute => false", () => {
  assertEquals(
    isRecent(
      new Date("2022-05-09T03:00:00.000+0900"),
      new Date("2022-05-09T03:50:00.000+0900"),
    ),
    false,
  );
});

Deno.test("isRecent 60 minute => false", () => {
  assertEquals(
    isRecent(
      new Date("2022-05-09T03:00:00.000+0900"),
      new Date("2022-05-09T04:00:00.000+0900"),
    ),
    false,
  );
});

Deno.test("isRecent just -30 minute => true", () => {
  assertEquals(
    isRecent(
      new Date("2022-05-09T03:00:00.000+0900"),
      new Date("2022-05-09T02:30:00.000+0900"),
    ),
    true,
  );
});

Deno.test("isRecent -50 minute => false", () => {
  assertEquals(
    isRecent(
      new Date("2022-05-09T03:00:00.000+0900"),
      new Date("2022-05-09T02:10:00.000+0900"),
    ),
    false,
  );
});

Deno.test("isToday 04:00", () => {
  assertEquals(
    isToday(
      new Date("2022-05-09T04:00:00.000+0900"),
      new Date("2022-05-09T04:00:00.000+0900"),
    ),
    true,
  );
});

Deno.test("isToday 03:59", () => {
  assertEquals(
    isToday(
      new Date("2022-05-10T03:59:00.000+0900"),
      new Date("2022-05-09T04:00:00.000+0900"),
    ),
    true,
  );
  assertEquals(
    isToday(
      new Date("2022-05-09T03:59:00.000+0900"),
      new Date("2022-05-09T04:00:00.000+0900"),
    ),
    false,
  );
});

Deno.test("isToday 00:00", () => {
  assertEquals(
    isToday(
      new Date("2022-05-10T00:00:00.000+0900"),
      new Date("2022-05-09T04:00:00.000+0900"),
    ),
    true,
  );
  assertEquals(
    isToday(
      new Date("2022-05-09T00:00:00.000+0900"),
      new Date("2022-05-09T04:00:00.000+0900"),
    ),
    false,
  );
});

Deno.test("isToday 23:59", () => {
  assertEquals(
    isToday(
      new Date("2022-05-09T23:59:00.000+0900"),
      new Date("2022-05-09T04:00:00.000+0900"),
    ),
    true,
  );
});

Deno.test("isToday 12/31 25:00", () => {
  assertEquals(
    isToday(
      new Date("2023-01-01T01:00:00.000+0900"),
      new Date("2022-12-31T04:00:00.000+0900"),
    ),
    true,
  );
  assertEquals(
    isToday(
      new Date("2022-12-31T01:00:00.000+0900"),
      new Date("2022-12-31T04:00:00.000+0900"),
    ),
    false,
  );
});
