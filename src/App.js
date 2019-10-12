// @flow
import React, {PureComponent} from "react";
import codeFrame from "babel-code-frame";
import {parse} from "@babel/parser";
import doc from "prettier/doc.js";
import * as Error from "./compiler/error.js";
import * as Monad from "./compiler/monad.js";
import * as Program from "./compiler/program.js";
import Output from "./Output.js";
import "./App.css";

type Props = {};

type State = {
  jsInput: string,
};

export default class App extends PureComponent<Props, State> {
  defaultJsInput = "// Type some JavaScript in here\n";

  state: State = {
    jsInput:
      typeof window !== "undefined"
        ? window.localStorage.getItem("jsInput") || this.defaultJsInput
        : this.defaultJsInput,
  };

  onChangeJsInput = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    const {value} = event.currentTarget;

    this.setState({jsInput: value});

    if (typeof window !== "undefined") {
      window.localStorage.setItem("jsInput", value);
    }
  };

  getJsAst(jsInput: string): any | string {
    try {
      const ast = parse(jsInput, {
        plugins: ["flow", "jsx"],
        sourceType: "module",
      });

      return ast;
    } catch (error) {
      const {loc} = error;

      if (loc) {
        return `${error.message}\n\n${codeFrame(
          jsInput,
          loc.line,
          loc.column,
        )}`;
      }
    }
  }

  getCoqAst(source: string, jsAst: any): any | string {
    try {
      const result = Monad.run(Program.compile(jsAst.program));

      switch (result.type) {
        case "Error":
          return Error.print(source, result.errors);
        case "Success":
          return result.value;
        default:
          return result;
      }
    } catch (error) {
      return error.message;
    }
  }

  getCoqString(coqAst: Program.t): string {
    const coqProgram: string = doc.printer.printDocToString(
      Program.print(coqAst),
      {
        printWidth: 40,
        tabWidth: 2,
      },
    ).formatted;

    return `(* Generated Coq *)

${coqProgram}`;
  }

  render() {
    const {jsInput} = this.state;
    const jsAst = this.getJsAst(jsInput);
    const coqAst =
      typeof jsAst !== "string" ? this.getCoqAst(jsInput, jsAst) : "";
    const coqString =
      typeof coqAst !== "string" ? this.getCoqString(coqAst) : "";

    return (
      <div>
        <div className="split js-source">
          <textarea onChange={this.onChangeJsInput} value={jsInput} />
        </div>
        <div className="split js-ast">
          <Output output={jsAst} />
        </div>
        <div className="split coq-ast">
          <Output output={coqAst} />
        </div>
        <div className="split coq-source">
          <Output output={coqString} />
        </div>
      </div>
    );
  }
}
