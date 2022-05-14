import dayjs from "https://cdn.skypack.dev/dayjs@1.10.4?dts";
import pluginUtc from "https://cdn.skypack.dev/dayjs@1.10.4/plugin/utc?dts";
import pluginTimezone from "https://cdn.skypack.dev/dayjs@1.10.4/plugin/timezone?dts";

dayjs.extend(pluginUtc);
dayjs.extend(pluginTimezone);

declare module "https://cdn.skypack.dev/dayjs@1.10.4?dts" {
  export const tz: {
    setDefault: (tz: string) => dayjs.Dayjs;
  };
  interface Dayjs {
    tz: (tz?: string) => dayjs.Dayjs;
  }
}

dayjs.tz.setDefault("Asia/Tokyo");

export default dayjs;
