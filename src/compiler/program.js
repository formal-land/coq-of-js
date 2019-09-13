// @flow
import * as Doc from "./doc.js";
import * as Statement from "./statement.js";

export type t = Statement.t[];

export function compile(program: {body: any[]}): t {
  return program.body.reduce(
    (accumulator, bodyElement) => [...accumulator, ...Statement.compile(bodyElement)],
    []
  );
}

export function print(program: t): Doc.t {
  return Doc.group(Doc.join(
    Doc.concat([Doc.hardline, Doc.hardline]),
    program.map(programElement => Statement.print(programElement)),
  ));
}
