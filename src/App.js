import React, {Component} from 'react';
import './App.css';

export default class App extends Component {
  state = {
    jsInput: 'function id<A>(x: A): A {\n  return x;\n}\n',
  };

  onChangeJsInput = event => {
    this.setState({jsInput: event.currentTarget.value});
  };

  render() {
    const {jsInput} = this.state;
    const coqOutput = 'Definition id {A : Type} (x : A) : A := x.\n'

    return (
      <div>
        <div className="split left">
          <textarea onChange={this.onChangeJsInput} value={jsInput} />
        </div>
        <div className="split right">
          <code><pre>{coqOutput}</pre></code>
        </div>
      </div>
    );
  }
}
