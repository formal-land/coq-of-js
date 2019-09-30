// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Monad from "./monad.js";

export type t = {
  type: "ArrayExpression",
  elements: t[],
} | {
  type: "BinaryExpression",
  left: t,
  operator: string,
  right: t
} | {
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
    case "ArrayExpression":
      return {
        type: "ArrayExpression",
        elements:
          expression.elements
            ? yield* Monad.all(expression.elements.map(function*(element) {
              if (!element) {
                return yield* Monad.raise(expression, "Expected non-empty elements in the array");
              }

              if (element.type === "SpreadElement") {
                return yield* Monad.raise(element, "Spread operator not handled");
              }

              return yield* compile(element);
            }))
            : yield* Monad.raise(expression, "Expected an array expression"),
      };
    case "BinaryExpression":
      return {
        type: "BinaryExpression",
        left: yield* compile(expression.left),
        operator: expression.operator,
        right: yield* compile(expression.right),
      };
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
    case "ArrayExpression":
      if (expression.elements.length === 0) {
        return "[]";
      }

      return Doc.group(
        Doc.concat([
          "[",
          Doc.indent(
            Doc.concat([
              Doc.line,
              Doc.join(Doc.concat([",", Doc.line]), expression.elements.map(element => print(element))),
            ])
            ),
          Doc.line,
          "]"
        ])
      );
    case "BinaryExpression":
      return Doc.group(
        Doc.join(Doc.line, [print(expression.left),expression.operator, print(expression.right)])
      );
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
