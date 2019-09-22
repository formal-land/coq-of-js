// @flow
import * as BabelAst from "./babel-ast.js";
import * as Expression from "./expression.js";
import * as Monad from "./monad.js";

export function* compile(statements: BabelAst.Statement[]): Monad.t<Expression.t> {
  if (statements.length === 0) {
    return Expression.tt;
  } else if (statements.length === 1) {
    switch (statements[0].type) {
      case "ReturnStatement":
        return statements[0].argument
          ? yield* Expression.compile(statements[0].argument)
          : Expression.tt;
      default:
        return yield* Monad.raise<Expression.t>(statements[0], "Expected a return");
    }
  }

  return yield* Monad.raise<Expression.t>(statements[0], "Expected a simple return");
}
