// @flow
import * as Error from "./error.js";

export type t<A> =
  | {
      type: "Error",
      errors: Error.t[],
    }
  | {
      type: "Success",
      value: A,
    };

export function merge<A>(results: t<A>[]): t<A[]> {
  return results.reduce(
    (accumulator: t<A[]>, result: t<A>) => {
      switch (accumulator.type) {
        case "Error":
          switch (result.type) {
            case "Error":
              return {
                type: "Error",
                errors: [...accumulator.errors, ...result.errors],
              };
            case "Success":
              return {
                type: "Error",
                errors: accumulator.errors,
              };
            /* istanbul ignore next */
            default:
              return result;
          }
        case "Success":
          switch (result.type) {
            case "Error":
              return {
                type: "Error",
                errors: result.errors,
              };
            case "Success":
              return {
                type: "Success",
                value: [...accumulator.value, result.value],
              };
            /* istanbul ignore next */
            default:
              return result;
          }
        /* istanbul ignore next */
        default:
          return accumulator;
      }
    },
    {type: "Success", value: []},
  );
}
