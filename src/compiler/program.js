// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Monad from "./monad.js";
import * as TopLevelStatement from "./top-level-statement.js";

export type t = TopLevelStatement.t[];

export function* compile(program: BabelAst.Program): Monad.t<t> {
  const unflattenedStatements = yield* Monad.all(
    program.body.map(statement => TopLevelStatement.compile(statement)),
  );

  return unflattenedStatements.reduce(
    (accumulator: t, statements: TopLevelStatement.t[]) => [
      ...accumulator,
      ...statements,
    ],
    [],
  );
}

export function print(program: t, withHeader: boolean): Doc.t {
  return Doc.group(
    Doc.concat([
      Doc.join(Doc.concat([Doc.hardline, Doc.hardline]), [
        ...(withHeader
          ? [
              `(* Generated by coq-of-js *)
Require Import Coq.Lists.List.
Require Import Coq.Strings.String.
Require Import Coq.ZArith.ZArith.

Import ListNotations.
Local Open Scope string.
Local Open Scope Z.`,
            ]
          : []),
        ...program.map(programElement =>
          TopLevelStatement.print(programElement),
        ),
      ]),
      Doc.hardline,
    ]),
  );
}
