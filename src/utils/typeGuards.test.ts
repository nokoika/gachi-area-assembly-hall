import { assertEquals } from "../deps/std.ts";
import { hasEnumValue } from "./typeGuards.ts";

Deno.test("hasEnumValue is able to use to EnumLike", () => {
  const EnumLike = {
    A: "a",
    B: "b",
    C: "c",
  } as const;
  type EnumLike = typeof EnumLike[keyof typeof EnumLike];

  assertEquals(hasEnumValue(EnumLike.A, EnumLike), true);
  assertEquals(hasEnumValue("b", EnumLike), true);
  assertEquals(hasEnumValue("x", EnumLike), false);

  // TODO: 型のUTもほしい
});

Deno.test("hasEnumValue is able to use to Enum", () => {
  enum Enum {
    A = "a",
    B = "b",
    C = "c",
  }

  assertEquals(hasEnumValue(Enum.A, Enum), true);
  assertEquals(hasEnumValue("b", Enum), true);
  assertEquals(hasEnumValue("x", Enum), false);
});
