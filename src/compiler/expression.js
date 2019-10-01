// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Monad from "./monad.js";
import * as Typ from "./typ.js";
import * as Util from "./util.js";

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
  type: "FunctionExpression",
  // eslint-disable-next-line no-use-before-define
  value: Fun,
} | {
  type: "TypeCastExpression",
  expression: t,
  typeAnnotation: Typ.t,
} | {
  type: "UnaryExpression",
  argument: t,
  operator: string,
} | {
  type: "Variable",
  name: string,
};

export type FunArgument = {
  name: string,
  typ: ?Typ.t,
};

export type Fun = {
  arguments: FunArgument[],
  body: t,
  returnTyp: ?Typ.t,
  typParameters: string[],
};

export const tt: t = {
  type: "Variable",
  name: "tt",
};

export function* compileStatements(statements: BabelAst.Statement[]): Monad.t<t> {
  if (statements.length === 0) {
    return tt;
  } else if (statements.length === 1) {
    switch (statements[0].type) {
      case "ReturnStatement":
        return statements[0].argument
          ? yield* compile(statements[0].argument)
          : tt;
      default:
        return yield* Monad.raise<t>(statements[0], "Expected a return");
    }
  }

  return yield* Monad.raise<t>(statements[0], "Expected a simple return");
}

export function* compileFun(
  fun : BabelAst.FunctionDeclaration | BabelAst.FunctionExpression | BabelAst.ArrowFunctionExpression
) : Monad.t<Fun> {
  const returnTyp = fun.returnType ? fun.returnType.typeAnnotation : null;

  return {
    arguments: yield* Monad.all(fun.params.map(function*(param) {
      switch (param.type) {
        case "Identifier":
            return {
              name: param.name,
              typ:
                param.typeAnnotation
                  ? yield* Typ.compile(param.typeAnnotation.typeAnnotation)
                  : null,
            };
        default:
          return yield* Monad.raise<FunArgument>(param, "Expected simple identifier as function parameter");
      }
    })),
    body:
      fun.body.type === "BlockStatement"
        ? yield* compileStatements(fun.body.body)
        : yield* compile(fun.body),
    returnTyp: returnTyp && (yield* Typ.compile(returnTyp)),
    typParameters:
      fun.typeParameters
        ? Util.filterMap(fun.typeParameters.params, param => param.name)
        : [],
  };
}

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
    case "ArrowFunctionExpression":
      return {
        type: "FunctionExpression",
        value: yield* compileFun(expression),
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
    case "ConditionalExpression":
      return {
        type: "ConditionalExpression",
        alternate: yield* compile(expression.alternate),
        consequent: yield* compile(expression.consequent),
        test: yield* compile(expression.test),
      };
    case "FunctionExpression":
      return {
        type: "FunctionExpression",
        value: yield* compileFun(expression),
      };
    case "Identifier":
      return {
        type: "Variable",
        name: expression.name,
      };
    case "LogicalExpression":
      return {
        type: "BinaryExpression",
        left: yield* compile(expression.left),
        operator: expression.operator,
        right: yield* compile(expression.right),
      };
    case "NullLiteral":
      return tt;
    case "NumericLiteral":
      return {
        type: "Constant",
        value: expression.value,
      };
    case "ParenthesizedExpression":
      return yield* compile(expression.expression);
    case "StringLiteral":
      return {
        type: "Constant",
        value: expression.value,
      };
    case "TypeCastExpression":
      return {
        type: "TypeCastExpression",
        expression: yield* compile(expression.expression),
        typeAnnotation: yield* Typ.compile(expression.typeAnnotation.typeAnnotation),
      };
    case "UnaryExpression":
      return {
        type: "UnaryExpression",
        argument: yield* compile(expression.argument),
        operator: expression.operator,
      }
    default:
      return yield* Monad.raiseUnhandled<t>(expression);
  }
}

export function printFunArguments(funArguments: FunArgument[]): Doc.t {
  return Doc.concat(
    funArguments.map(({name, typ}) =>
      Doc.concat([
        Doc.line,
        (typ
          ? Doc.group(Doc.concat(["(", name, Doc.line, ":", Doc.line, Typ.print(typ), ")"]))
          : name
        ),
      ])
    )
  );
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
    case "FunctionExpression":
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.concat([
            Doc.group(
              Doc.concat([
                "fun",
                Doc.indent(
                  Doc.concat([
                    ...(expression.value.typParameters.length !== 0
                      ? [Doc.line, Typ.printImplicitTyps(expression.value.typParameters)]
                      : []
                    ),
                    printFunArguments(expression.value.arguments),
                  ]),
                ),
                Doc.line,
                "=>",
              ]),
            ),
            Doc.indent(
              Doc.concat([Doc.line, print(false, expression.value.body)])
            ),
          ])
        )
      );
    case "TypeCastExpression":
      return Doc.group(
        Doc.concat([
          "(",
          Doc.softline,
          print(true, expression.expression),
          Doc.line,
          ":",
          Doc.line,
          Typ.print(expression.typeAnnotation),
          Doc.softline,
          ")",
        ])
      )
    case "UnaryExpression":
      return Doc.paren(
        needParens,
        Doc.group(Doc.concat([expression.operator, Doc.line, print(true, expression.argument)])),
      );
    case "Variable":
      return expression.name;
    default:
      return expression;
  }
}
