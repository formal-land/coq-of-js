import React, {Component} from 'react';
import CoqOutput from './CoqOutput.js';

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

    return (
      <div>
        <div className="split left">
          <textarea onChange={this.onChangeJsInput} value={jsInput} />
        </div>
        <CoqOutput jsInput={jsInput} />
      </div>
    );
  }
}
