// @flow
import * as Statement from "./statement.js";

export type t = Statement.t[];

export function compile(program: any): t {
  return program.body.map(bodyElement => Statement.compile(bodyElement));
}
