// @flow
import {codeFrameColumns} from "@babel/code-frame";
import * as BabelAst from "./babel-ast.js";

export type t = {
  location: BabelAst.SourceLocation,
  message: string,
};

export function print(source: string, errors: t[]): string {
  return errors.map(error => {
    const errorSourceCode = codeFrameColumns(source, error.location);

    return `${errorSourceCode}\n\n${error.message}`;
  }).join("\n\n");
}
