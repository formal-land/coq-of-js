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
  type: "CallExpression",
  arguments: t[],
  callee: t,
} | {
  type: "ConditionalExpression",
  alternate: t,
  consequent: t,
  test: t,
} | {
  type: "Constant",
  value: boolean | number | string,
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
                return yield* Monad.raise<t>(expression, "Expected non-empty elements in the array");
              }

              if (element.type === "SpreadElement") {
                return yield* Monad.raise<t>(element, "Spread operator not handled");
              }

              return yield* compile(element);
            }))
            : yield* Monad.raise<t[]>(expression, "Expected an array expression"),
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
    case "CallExpression":
      return {
        type: "CallExpression",
        arguments: yield* Monad.all(expression.arguments.map(function*(argument) {
          switch (argument.type) {
            case "ArgumentPlaceholder":
            case "JSXNamespacedName":
            case "SpreadElement":
              return yield* Monad.raise<t>(argument, "Unhandled function argument");
            default:
              return yield* compile(argument);
          }
        })),
        callee: yield* compile(expression.callee),
      };
    case "ConditionalExpression": {
      return {
        type: "ConditionalExpression",
        alternate: yield* compile(expression.alternate),
        consequent: yield* compile(expression.consequent),
        test: yield* compile(expression.test),
      };
    }
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

export function print(needParens: boolean, expression: t): Doc.t {
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
              Doc.join(
                Doc.concat([",", Doc.line]),
                expression.elements.map(element => print(false, element))
              ),
            ])
          ),
          Doc.line,
          "]"
        ])
      );
    case "BinaryExpression":
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.join(
            Doc.line,
            [print(true, expression.left),expression.operator, print(true, expression.right)]
          )
        )
      );
    case "CallExpression":
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.indent(
            Doc.join(
              Doc.line,
              [
                print(true, expression.callee),
                ...expression.arguments.map(argument => print(true, argument)),
              ],
            )
          )
        )
      );
    case "ConditionalExpression": {
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.concat([
            Doc.group(
              Doc.concat([
                "if",
                Doc.line,
                print(false, expression.test),
                Doc.line,
                "then",
              ])
            ),
            Doc.indent(Doc.concat([
              Doc.line,
              print(false, expression.consequent),
            ])),
            Doc.line,
            "else",
            Doc.indent(Doc.concat([
              Doc.line,
              print(false, expression.alternate),
            ])),
          ])
        )
      );
    }
    case "Constant":
      return JSON.stringify(expression.value);
    case "Variable":
      return expression.name;
    default:
      return expression;
  }
}
