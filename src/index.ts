import yargs from "yargs";
import * as chrono from "chrono-node";
import * as dayjs from "dayjs";

enum Endpoint {
  From = "from",
  To = "to",
}
type ParamSet = {
  readonly [index in chrono.Component]?: string;
};
type ParamMap = {
  [index in Endpoint]: ParamSet;
};

const params: ParamMap = {
  from: { year: "year", month: "month", day: "day" },
  to: { year: "y2", month: "m2", day: "d2" },
};

function asURLTuple(
  date: chrono.ParsedResult,
  part: chrono.Component,
  endpoint: Endpoint
): string {
  return `${params[endpoint][part]}=${date.start.get(part)}`;
}

function allTuplesFor(date: chrono.ParsedResult, as: Endpoint): string {
  console.log(as, Object.keys(params[as]));
  return Object.keys(params[as])
    .map((part) => asURLTuple(date, part as chrono.Component, as))
    .join("&");
}

function bothEndpoints(
  from: chrono.ParsedResult,
  to: chrono.ParsedResult
): string {
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

const fromDate = chrono.parse(args.from)[0];
const toDate = chrono.parse(args.to)[0];

const baseURL = "https://www.timeanddate.com/calendar/print.html?";
const formatOptions = "&country=1&typ=4&cols=1&display=1";

const calendarURL = [
  baseURL,
  bothEndpoints(fromDate, toDate),
  formatOptions,
].join("");
console.log("Hello!\n", args);
console.log(calendarURL);
