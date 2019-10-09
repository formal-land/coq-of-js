// @flow
import * as BabelAst from "./babel-ast.js";

const nameMapping: {[name: string]: string} = {
  Props: "_Props",
};

export function compile(identifier: BabelAst.Identifier): string {
  const {name} = identifier;

  return nameMapping[name] || name;
}
