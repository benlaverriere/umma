import yargs from "yargs";
import { hideBin } from "yargs/helpers";
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

function safelyToDayjs(date: string): dayjs.Dayjs | null {
  const chronoDate = chrono.parseDate(date);
  const dayjsDate = dayjs(chronoDate);

  if (!chronoDate || !dayjsDate.isValid()) {
    console.error(`'${date}' doesn't make sense as a date.`);
    process.exitCode = 1;
    return null;
  }

  return dayjsDate;
}

const args = yargs(hideBin(process.argv))
  .options({
    from: {
      describe: "start date, included in the calendar",
      type: "string",
      demandOption: true,
      alias: ["f", "start", "s"],
    },
    to: {
      describe: "end date, not included in the calendar",
      type: "string",
      demandOption: true,
      alias: ["t", "until", "u", "end", "e", "til"],
    },
  })
  .epilogue(
    "Both dates can be anything that Chrono can parse, like '17 August 2053' or '3 months from now'. See https://github.com/wanasit/chrono for details."
  ).argv;

const fromDate = safelyToDayjs(args.from);
const toDate = safelyToDayjs(args.to)?.subtract(1, "day");

const baseURL = "https://www.timeanddate.com/calendar/print.html?";
const formatURLParams = "&country=1&typ=4&cols=1&display=1";
const cliDateOutputFormat = "YYYY-MM-DD";

if (!fromDate || !toDate) {
  process.exitCode = 1;
} else {
  const calendarURL = [
    baseURL,
    bothEndpoints(fromDate, toDate),
    formatURLParams,
  ].join("");

  console.log(
    `Calendar from ${args.from} (${fromDate.format(
      cliDateOutputFormat
    )}) until ${args.to} (${toDate.format(cliDateOutputFormat)}):`
  );
  console.log(calendarURL);
}
