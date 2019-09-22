// @flow
import * as BabelAst from "./babel-ast.js";
import * as Error from "./error.js";

type Yield = {
  type: "All",
  expressions: Generator<Yield, any, any>[],
} | {
  type: "LocationSet",
  expression: Generator<Yield, any, any>,
  location: BabelAst.SourceLocation,
} | {
  type: "Raise",
  message: string,
};

export type t<A> = Generator<Yield, A, any>;

type Result<A> = {
  type: "Error",
  errors: Error.t[],
} | {
  type: "Success",
  value: A,
};

export function* all<A>(expressions: t<A>[]): t<A[]> {
  return yield {type: "All", expressions};
}

export function* locationSet<A>(
  location: BabelAst.SourceLocation,
  expression: t<A>
): t<A> {
  return yield {type: "LocationSet", expression, location};
}

export function* raise<A>(message: string): t<A> {
  return yield {type: "Raise", message};
}

export function* raiseUnhandled<A>(node: BabelAst.Node): t<A> {
  return yield* raise(`Unhandled syntax:\n${JSON.stringify(node, null, 2)}`);
}

function runWithAnswer<A>(
  location: BabelAst.SourceLocation,
  expression: t<A>,
  answer?: any
): Result<any> {
  const result = expression.next(answer);

  if (result.done) {
    return {
      type: "Success",
      value: result.value,
    };
  }

  const nextAnswer: Result<any> = (() => {
    switch (result.value.type) {
      case "All": {
        const results = result.value.expressions.map(expression => runWithAnswer(location, expression));
        return results.reduce(
          (accumulator: Result<any[]>, result) => {
            switch (accumulator.type) {
              case "Error":
                switch (result.type) {
                  case "Error":
                    return {
                      type: "Error",
                      errors: [...accumulator.errors, ...result.errors],
                    };
                  case "Success":
                    return {
                      type: "Error",
                      errors: accumulator.errors,
                    };
                  default:
                    return result;
                }
              case "Success":
                switch (result.type) {
                  case "Error":
                    return {
                      type: "Error",
                      errors: result.errors,
                    };
                  case "Success":
                    return {
                      type: "Success",
                      value: [...accumulator.value, result.value],
                    };
                  default:
                    return result;
                }
              default:
                return accumulator;
            }
          },
          {type: "Success", value: []}
        );
      }
      case "LocationSet":
        return runWithAnswer(result.value.location, result.value.expression);
      case "Raise": {
        const error = {location, message: result.value.message};

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
      return runWithAnswer(location, expression, nextAnswer.value);
    default:
      return nextAnswer;
  }
}

export function run<A>(location: BabelAst.SourceLocation, expression: t<A>): Result<A> {
  return runWithAnswer(location, expression);
}
