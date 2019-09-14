// @flow
import * as Doc from "./doc.js";
import * as Monad from "./monad.js";
import * as Statement from "./statement.js";

export type t = Statement.t[];

export function* compile(program: {body: any[]}): Monad.t<t> {
  const unflattenedStatements = yield* Monad.all(
    program.body.map(bodyElement => Monad.locationSet(bodyElement.loc, Statement.compile(bodyElement)))
  );

  return unflattenedStatements.reduce(
    (accumulator, statements) => [...accumulator, ...statements],
    [],
  );
}

export function print(program: t): Doc.t {
  return Doc.group(Doc.join(
    Doc.concat([Doc.hardline, Doc.hardline]),
    program.map(programElement => Statement.print(programElement)),
  ));
}
