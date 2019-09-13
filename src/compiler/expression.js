// @flow
import * as Doc from "./doc.js";

export type t = {
  type: "StringLiteral",
  value: string,
} | {
  type: "Variable",
  name: string,
};

export function compile(expression: any): t {
  switch (expression.type) {
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
    case "StringLiteral":
      return JSON.stringify(expression.value);
    case "Variable":
      return expression.name;
    default:
      return expression;
  }
}
