// @flow
import {parse} from "@babel/parser";
import doc from "prettier/doc.js";
import * as Error from "./error.js";
import * as Monad from "./monad.js";
import * as Program from "./program.js";

export function compileAndPrint(
  jsInput: string,
  printWidth: number = 80,
): string {
  const jsAst = parse(jsInput, {
    plugins: ["flow", "jsx"],
    sourceType: "module",
  });
  const coqAst = Monad.run(Program.compile(jsAst.program));

  switch (coqAst.type) {
    case "Error":
      return Error.print(jsInput, coqAst.errors);
    case "Success":
      return doc.printer.printDocToString(Program.print(coqAst.value), {
        printWidth,
        tabWidth: 2,
      }).formatted;
    /* istanbul ignore next */
    default:
      return coqAst;
  }
}
