// @flow
import * as Location from "./location.js";

export type t = {
  location: Location.t,
  message: string,
};

export function print(source: string, errors: t[]): string {
  return errors.map(error => Location.print(source, error.location) + "\n" + error.message).join("\n\n");
}
