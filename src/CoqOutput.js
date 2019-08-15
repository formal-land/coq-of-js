// @flow
import React, {PureComponent} from 'react';
import codeFrame from 'babel-code-frame';
import {parse} from '@babel/parser';

type Props = {
  jsInput: string,
};

export default class CoqOutput extends PureComponent<Props> {
  getCoqOutput() {
    const {jsInput} = this.props;

    try {
      const ast = parse(jsInput, {
        plugins: [
          'flow',
          'jsx',
        ],
        sourceType: 'module',
      });

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
