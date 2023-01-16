// @flow
import React, {PureComponent} from "react";
import codeFrame from "babel-code-frame";
import {parse} from "@babel/parser";
import doc from "prettier/doc.js";
import * as BabelAst from "./compiler/babel-ast.js";
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

function ExternalLink() {
  return <svg width="13.5" height="13.5" aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"></path></svg>;
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

  getJsAst(jsInput: string): BabelAst.File | string {
    try {
      const ast = parse(jsInput, {
        plugins: ["flow", "jsx"],
        sourceType: "module",
      });

      return ast;
    } catch (error) {
      const {loc} = error;

      return `${error.message}\n\n${codeFrame(jsInput, loc.line, loc.column)}`;
    }
  }

  getCoqAst(source: string, jsAst: BabelAst.File): Program.t | string {
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
    return doc.printer.printDocToString(Program.print(coqAst, true), {
      printWidth: 60,
      tabWidth: 2,
    }).formatted;
  }

  getOutputs(jsInput: string): {coq: string, coqAst: string, jsAst: string} {
    const jsAst = this.getJsAst(jsInput);

    if (typeof jsAst === "string") {
      return {coq: jsAst, coqAst: "", jsAst: ""};
    }

    const coqAst = this.getCoqAst(jsInput, jsAst);

    if (typeof coqAst === "string") {
      return {coq: coqAst, coqAst: "", jsAst: ""};
    }

    return {
      coq: this.getCoqString(coqAst),
      coqAst: JSON.stringify(coqAst, null, 2),
      jsAst: JSON.stringify(jsAst, null, 2),
    };
  }

  render() {
    const {jsInput} = this.state;
    const {coq, coqAst, jsAst} = this.getOutputs(jsInput);

    return (
      <div>
        <div className="header">
          <h1>
            <span className="logo">
              <span aria-label="globe" role="img">
                🌍
              </span>{" "}
              <span aria-label="rooster" role="img">
                🐓
              </span>
            </span>
            coq-of-js
            <span className="signature">by <a href="https://formal.land/" rel="noopener noreferrer" target="_blank">Formal&nbsp;Land&nbsp;🌲&nbsp;<ExternalLink /></a></span>
            <a
              className="sub-title"
              href="https://github.com/formal-land/coq-of-js"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub&nbsp;<ExternalLink />
            </a>
          </h1>
        </div>
        <div className="split js-source">
          <h2>🌍 JavaScript editor</h2>
          <textarea onChange={this.onChangeJsInput} value={jsInput} />
        </div>
        <div className="split coq-source">
          <h2>🐓 Generated Coq</h2>
          <Output output={coq} />
        </div>
        <div className="split js-ast">
          <h2>🔬 JavaScript AST</h2>
          <Output output={jsAst} />
        </div>
        <div className="split coq-ast">
          <h2>🔬 Coq AST</h2>
          <Output output={coqAst} />
        </div>
      </div>
    );
  }
}
