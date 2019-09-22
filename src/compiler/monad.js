// @flow
import * as BabelAst from "./babel-ast.js";
import * as Result from "./result.js";

type Yield = {
  type: "All",
  expressions: Generator<Yield, any, any>[],
} | {
  type: "Raise",
  message: string,
  node: BabelAst.Node,
};

export type t<A> = Generator<Yield, A, any>;

export function* all<A>(expressions: t<A>[]): t<A[]> {
  return yield {type: "All", expressions};
}

export function* raise<A>(node: BabelAst.Node, message: string): t<A> {
  return yield {type: "Raise", message, node};
}

export function* raiseUnhandled<A>(node: BabelAst.Node): t<A> {
  return yield* raise<A>(node, `Unhandled syntax:\n${JSON.stringify(node, null, 2)}`);
}

function runWithAnswer<A>(expression: t<A>, answer?: any): Result.t<any> {
  const result = expression.next(answer);

  if (result.done) {
    return {
      type: "Success",
      value: result.value,
    };
  }

  const nextAnswer: Result.t<any> = (() => {
    switch (result.value.type) {
      case "All": {
        const results = result.value.expressions.map(expression => runWithAnswer(expression));

        return Result.merge(results);
      }
      case "Raise": {
        const error = {location: result.value.node.loc, message: result.value.message};

        return {type: "Error", errors: [error]};
      }
      default:
        return result.value;
    }
  })();

  switch (nextAnswer.type) {
    case "Error":
      return nextAnswer;
    case "Success":
      return runWithAnswer(expression, nextAnswer.value);
    default:
      return nextAnswer;
  }
}

export function run<A>(expression: t<A>): Result.t<A> {
  return runWithAnswer(expression);
}
