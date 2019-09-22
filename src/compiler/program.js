// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Monad from "./monad.js";
import * as TopLevelStatement from "./top-level-statement.js";

export type t = TopLevelStatement.t[];

export function* compile(program: BabelAst.Program): Monad.t<t> {
  const unflattenedStatements = yield* Monad.all(
    program.body.map(statement => TopLevelStatement.compile(statement))
  );

  return unflattenedStatements.reduce(
    (accumulator: t, statements: TopLevelStatement.t[]) => [...accumulator, ...statements],
    [],
  );
}

export function print(program: t): Doc.t {
  return Doc.group(Doc.join(
    Doc.concat([Doc.hardline, Doc.hardline]),
    program.map(programElement => TopLevelStatement.print(programElement)),
  ));
}
