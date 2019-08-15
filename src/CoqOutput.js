import React, {PureComponent} from 'react';
import {parse} from '@babel/parser';

export default class CoqOutput extends PureComponent {
  getCoqOutput() {
    const {jsInput} = this.props;
    const ast = parse(jsInput, {
      plugins: [
        'flow',
        'jsx',
      ],
      sourceType: 'module',
    });

    return JSON.stringify(ast, null, 2);
  }

  render() {
    return (
      <div className="split right">
        <code><pre>{this.getCoqOutput()}</pre></code>
      </div>
    );
  }
}
