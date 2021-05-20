import yargs from "yargs";
import * as chrono from "chrono-node";
import dayjs from "dayjs";

enum Endpoint {
  From = "from",
  To = "to",
}
type ParamSet = {
  readonly [index in dayjs.UnitType]?: string;
};
type ParamMap = {
  [index in Endpoint]: ParamSet;
};

const params: ParamMap = {
  from: { year: "year", month: "month", date: "day" },
  to: { year: "y2", month: "m2", date: "d2" },
};

function asURLTuple(
  date: dayjs.Dayjs,
  part: dayjs.UnitType,
  endpoint: Endpoint
): string {
  const adjustment = part === "month" ? +1 : 0;
  return `${params[endpoint][part]}=${date.get(part) + adjustment}`;
}

function allTuplesFor(date: dayjs.Dayjs, as: Endpoint): string {
  return Object.keys(params[as])
    .map((part) => asURLTuple(date, part as dayjs.UnitType, as))
    .join("&");
}

function bothEndpoints(from: dayjs.Dayjs, to: dayjs.Dayjs): string {
  return [
    allTuplesFor(from, Endpoint.From),
    allTuplesFor(to, Endpoint.To),
  ].join("&");
}

const args = yargs
  .options({
    from: { type: "string", demandOption: true, alias: "f" },
    to: { type: "string", demandOption: true, alias: "t" },
  })
  .alias({ to: ["until", "u", "end", "e"], from: ["start", "s"] }).argv;

const fromDate = dayjs(chrono.parseDate(args.from));
const toDate = dayjs(chrono.parseDate(args.to)).subtract(1, "day");

const baseURL = "https://www.timeanddate.com/calendar/print.html?";
const formatOptions = "&country=1&typ=4&cols=1&display=1";

const calendarURL = [
  baseURL,
  bothEndpoints(fromDate, toDate),
  formatOptions,
].join("");
const outputFormat = "YYYY-MM-DD";

console.log(
  `Calendar from ${args.from} (${fromDate.format(outputFormat)}) until ${
    args.to
  } (${toDate.format(outputFormat)}):`
);
console.log(calendarURL);
