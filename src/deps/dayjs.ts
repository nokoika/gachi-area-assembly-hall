import dayjs from "https://cdn.skypack.dev/dayjs@1.10.4?dts";
import pluginUtc from "https://cdn.skypack.dev/dayjs@1.10.4/plugin/utc?dts";
import pluginTimezone from "https://cdn.skypack.dev/dayjs@1.10.4/plugin/timezone?dts";

dayjs.extend(pluginUtc);
dayjs.extend(pluginTimezone);

// おそらくextendするとdayjs.tzが生えると思われるが、うまく型定義で表現できてなさそうなのでanyとする
// deno-lint-ignore no-explicit-any
(dayjs as any).tz.setDefault("Asia/Tokyo");

export default dayjs;
