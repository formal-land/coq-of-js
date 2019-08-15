// @flow
import React, {PureComponent} from 'react';
import codeFrame from 'babel-code-frame';
import {parse} from '@babel/parser';
import * as Program from "./compiler/program.js";

type Props = {
  jsInput: string,
};

export default class CoqOutput extends PureComponent<Props> {
  getCoqOutput(): string {
    const {jsInput} = this.props;

    try {
      const ast = parse(jsInput, {
        plugins: [
          'flow',
          'jsx',
        ],
        sourceType: 'module',
      });
      const compiledAst = Program.compile(ast.program);

      console.log(JSON.stringify(compiledAst, null, 2));

      return JSON.stringify(ast, null, 2);
    } catch (error) {
      const {loc} = error;

      if (loc) {
        return `${error.message}\n\n${codeFrame(jsInput, loc.line, loc.column)}`;
      }

      throw error;
    }
  }

  render() {
    return (
      <div className="split right">
        <code><pre>{this.getCoqOutput()}</pre></code>
      </div>
    );
  }
}
