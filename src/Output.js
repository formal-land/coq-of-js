// @flow
import React, {PureComponent} from "react";

type Props = {
  output: string,
};

export default class CoqOutput extends PureComponent<Props> {
  render() {
    const {output} = this.props;

    return (
      <code>
        <pre>{output}</pre>
      </code>
    );
  }
}
