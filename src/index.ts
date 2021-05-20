import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as chrono from "chrono-node";
import dayjs from "dayjs";
import open from "open";

import { Endpoint, ParamSet, ParamMap, RelevantUnit, URLTuple } from "./types";

const params: ParamMap = {
  from: { year: "year", month: "month", date: "day" },
  to: { year: "y2", month: "m2", date: "d2" },
};

function allTuplesFor(
  date: dayjs.Dayjs,
  endpoint: Endpoint
): readonly URLTuple[] {
  const paramMapping = params[endpoint];
  return Object.entries(paramMapping).map(([part, label]) => {
    // dayjs months are zero-indexed; timeanddate.com's are one-indexed
    const adjustment = part === "month" ? +1 : 0;

    return [label, date.get(part as RelevantUnit) + adjustment];
  });
}

function bothEndpoints(
  from: dayjs.Dayjs,
  to: dayjs.Dayjs
): readonly URLTuple[] {
  return [
    ...allTuplesFor(from, Endpoint.From),
    ...allTuplesFor(to, Endpoint.To),
  ];
}

function tupleArrayAsString(tuples: readonly URLTuple[]): string {
  return tuples.map((tuple) => tuple.join("=")).join("&");
}

function safelyToDayjs(date: string): dayjs.Dayjs | null {
  const chronoDate: Date | null = chrono.parseDate(date);
  const dayjsDate = dayjs(chronoDate);

  if (chronoDate === null || !dayjsDate.isValid()) {
    console.error(date, " doesn't make sense as a date.");
    process.exitCode = 1;
    return null;
  }

  return dayjsDate;
}

const args = yargs(hideBin(process.argv))
  .usage("$0 --from <date> --until <date>")
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
    holidays: {
      boolean: true,
      describe: "include holidays and moon phases",
      default: false,
      alias: ["moon"],
    },
    open: {
      boolean: true,
      describe: "open URL automatically",
      default: false,
      alias: ["o"],
    },
  })
  .epilogue(
    "Both dates can be anything that Chrono can parse, like '17 August 2053' or '3 months from now'. See https://github.com/wanasit/chrono for details."
  ).argv;

const fromDate = safelyToDayjs(args.from);
const toDate = safelyToDayjs(args.to)?.subtract(1, "day");

const baseURL = "https://www.timeanddate.com/calendar/print.html";
const formatURLParams: URLTuple[] = [
  ["country", 1],
  ["typ", 4],
  ["cols", 1],
  ["display", 1],
];
if (args.holidays) {
  formatURLParams.push(["df", 1]);
}
const cliDateOutputFormat = "YYYY-MM-DD";

if (!fromDate || !toDate) {
  process.exitCode = 1;
} else {
  const urlParams: URLTuple[] = [
    ...bothEndpoints(fromDate, toDate),
    ...formatURLParams,
  ];
  const calendarURL = [baseURL, tupleArrayAsString(urlParams)].join("?");

  console.log(
    `Calendar from ${args.from} (${fromDate.format(
      cliDateOutputFormat
    )}) until ${args.to} (${toDate.format(cliDateOutputFormat)}):`
  );
  console.log(calendarURL);
  if (args.open) {
    open(calendarURL).catch(() => {
      console.error("Could not open URL in default browser.");
      process.exitCode = 1;
    });
  }
}
