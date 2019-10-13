// @flow
import React, {PureComponent} from "react";
import codeFrame from "babel-code-frame";
import {parse} from "@babel/parser";
import doc from "prettier/doc.js";
import * as Error from "./compiler/error.js";
import * as Monad from "./compiler/monad.js";
import * as Program from "./compiler/program.js";
import demoInput from "./demoInput.js";
import Output from "./Output.js";
import "./App.css";

type Props = {};

type State = {
  jsInput: string,
};

function getInitialJsInput(): string {
  if (typeof window !== "undefined") {
    const item = window.sessionStorage.getItem("jsInput");

    return typeof item === "string" ? item : demoInput;
  }

  return demoInput;
}

export default class App extends PureComponent<Props, State> {
  state: State = {
    jsInput: getInitialJsInput(),
  };

  onChangeJsInput = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    const {value} = event.currentTarget;

    this.setState({jsInput: value});

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("jsInput", value);
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
    return doc.printer.printDocToString(Program.print(coqAst), {
      printWidth: 60,
      tabWidth: 2,
    }).formatted;
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
          <h1>
            <span aria-label="globe" role="img">
              🌍
            </span>{" "}
            JavaScript editor
          </h1>
          <textarea onChange={this.onChangeJsInput} value={jsInput} />
        </div>
        <div className="split js-ast">
          <h1>JavaScript AST</h1>
          <Output output={jsAst} />
        </div>
        <div className="split coq-ast">
          <h1>Coq AST</h1>
          <Output output={coqAst} />
        </div>
        <div className="split coq-source">
          <h1>
            <span aria-label="rooster" role="img">
              🐓
            </span>{" "}
            Generated Coq
          </h1>
          <Output output={coqString} />
        </div>
      </div>
    );
  }
}
