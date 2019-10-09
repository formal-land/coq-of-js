// @flow
import React, {PureComponent} from "react";

type Props = {
  output: any | string,
};

export default class CoqOutput extends PureComponent<Props> {
  render() {
    const {output} = this.props;

    return (
      <code>
        <pre>
          {typeof output !== "string"
            ? JSON.stringify(output, null, 2)
            : output}
        </pre>
      </code>
    );
  }
}
