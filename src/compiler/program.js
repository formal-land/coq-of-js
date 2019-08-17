// @flow
import doc from "./doc.js";
import * as Statement from "./statement.js";

export type t = Statement.t[];

export function compile(program: any): t {
  return program.body.map(bodyElement => Statement.compile(bodyElement));
}

export function print(program: t): any {
  return doc.group(doc.join(
    doc.concat([doc.hardline, doc.hardline]),
    program.map(programElement => Statement.print(programElement)),
  ));
}
