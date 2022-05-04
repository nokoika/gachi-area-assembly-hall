export const hasEnumValue = <T extends Record<string, string>>(
  k: string,
  o: T,
): k is Extract<keyof T, string> => {
  return Object.values(o).includes(k);
};
