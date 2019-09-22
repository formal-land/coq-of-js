// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Monad from "./monad.js";

export type t = {
  type: "Constant",
  value: boolean | number | string,
} | {
  type: "Let",
  body: t,
  definition: t,
  name: string,
} | {
  type: "Variable",
  name: string,
};

export const tt: t = {
  type: "Variable",
  name: "tt",
};

export function* compile(expression: BabelAst.Expression): Monad.t<t> {
  switch (expression.type) {
    case "BooleanLiteral":
      return {
        type: "Constant",
        value: expression.value,
      };
    case "Identifier":
      return {
        type: "Variable",
        name: expression.name,
      };
    case "NullLiteral":
      return tt;
    case "NumericLiteral":
      return {
        type: "Constant",
        value: expression.value,
      };
    case "StringLiteral":
      return {
        type: "Constant",
        value: expression.value,
      };
    default:
      return yield* Monad.raiseUnhandled<t>(expression);
  }
}

export function print(expression: t): Doc.t {
  switch (expression.type) {
    case "Constant":
      return JSON.stringify(expression.value);
    case "Let":
      return "let";
    case "Variable":
      return expression.name;
    default:
      return expression;
  }
}
