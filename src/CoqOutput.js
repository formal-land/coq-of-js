import React, {PureComponent} from 'react';

export default class CoqOutput extends PureComponent {
  getCoqOutput() {
    const {jsInput} = this.props;

    return `(* Generated code *)

${jsInput}`;
  }

  render() {
    return (
      <div className="split right">
        <code><pre>{this.getCoqOutput()}</pre></code>
      </div>
    );
  }
}
