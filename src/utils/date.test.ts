import { assertEquals } from "https://deno.land/std@0.137.0/testing/asserts.ts";
import { isRecent } from "./date.ts";

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
