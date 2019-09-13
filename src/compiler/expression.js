// @flow
import * as Doc from "./doc.js";

export type t = {
  type: "BooleanLiteral",
  value: boolean,
} | {
  type: "StringLiteral",
  value: string,
} | {
  type: "Variable",
  name: string,
};

export function compile(expression: any): t {
  switch (expression.type) {
    case "BooleanLiteral":
      return {
        type: "BooleanLiteral",
        value: expression.value,
      };
    case "Identifier":
      return {
        type: "Variable",
        name: expression.name,
      };
    case "StringLiteral":
      return {
        type: "StringLiteral",
        value: expression.value,
      };
    default:
      throw new Error(JSON.stringify(expression, null, 2));
  }
}

export function print(expression: t): Doc.t {
  switch (expression.type) {
    case "BooleanLiteral":
      return JSON.stringify(expression.value);
    case "StringLiteral":
      return JSON.stringify(expression.value);
    case "Variable":
      return expression.name;
    default:
      return expression;
  }
}
