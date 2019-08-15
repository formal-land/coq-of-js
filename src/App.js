// @flow
import React, {PureComponent} from 'react';
import CoqOutput from './CoqOutput.js';
import './App.css';

type Props = {};

type State = {
  jsInput: string,
};

export default class App extends PureComponent<Props, State> {
  state: State = {
    jsInput: 'function id<A>(x: A): A {\n  return x;\n}\n',
  };

  onChangeJsInput = (event: SyntheticEvent<*>) => {
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
