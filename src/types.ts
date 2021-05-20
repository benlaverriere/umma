import { UnitType } from "dayjs";

export enum Endpoint {
  From = "from",
  To = "to",
}
export type RelevantUnit = Extract<UnitType, "year" | "month" | "date">;

export type ParamSet = {
  readonly [index in RelevantUnit]: string;
};

export type ParamMap = {
  readonly [index in Endpoint]: ParamSet;
};

export type URLTuple = readonly [string, number];
