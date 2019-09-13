// @flow
import * as Doc from "./doc.js";
import * as Statement from "./statement.js";

export type t = Statement.t[];

export function compile(program: any): t {
  return program.body.map(bodyElement => Statement.compile(bodyElement));
}

export function print(program: t): Doc.t {
  return Doc.group(Doc.join(
    Doc.concat([Doc.hardline, Doc.hardline]),
    program.map(programElement => Statement.print(programElement)),
  ));
}
