// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Identifier from "./identifier.js";
import * as Monad from "./monad.js";
import * as Typ from "./typ.js";
import * as Util from "./util.js";

type LeftValueRecordField = {
  name: string,
  variable: string,
};

type LeftValue =
  | {
      type: "Record",
      fields: LeftValueRecordField[],
      record: string,
    }
  | {
      type: "Variable",
      name: string,
    };

export type t =
  | {
      type: "ArrayExpression",
      elements: t[],
    }
  | {
      type: "BinaryExpression",
      left: t,
      operator: string,
      right: t,
    }
  | {
      type: "CallExpression",
      arguments: t[],
      callee: t,
    }
  | {
      type: "ConditionalExpression",
      alternate: t,
      consequent: t,
      test: t,
    }
  | {
      type: "Constant",
      value: boolean | number | string,
    }
  | {
      type: "EnumDestruct",
      branches: {body: t, names: string[]}[],
      defaultBranch: ?t,
      discriminant: t,
      typName: string,
    }
  | {
      type: "EnumInstance",
      instance: string,
      typName: string,
    }
  | {
      type: "FunctionExpression",
      // eslint-disable-next-line no-use-before-define
      value: Fun,
    }
  | {
      type: "Let",
      body: t,
      lval: LeftValue,
      value: t,
    }
  | {
      type: "RecordInstance",
      // eslint-disable-next-line no-use-before-define
      fields: RecordField[],
      record: string,
    }
  | {
      type: "RecordProjection",
      field: string,
      object: t,
      record: string,
    }
  | {
      type: "SumDestruct",
      branches: {body: t, fields: LeftValueRecordField[], name: string}[],
      defaultBranch: ?t,
      discriminant: t,
      sum: string,
    }
  | {
      type: "SumInstance",
      constr: string,
      // eslint-disable-next-line no-use-before-define
      fields: RecordField[],
      sum: string,
    }
  | {
      type: "TypeCastExpression",
      expression: t,
      typeAnnotation: Typ.t,
    }
  | {
      type: "UnaryExpression",
      argument: t,
      operator: string,
    }
  | {
      type: "Variable",
      name: string,
    };

export type FunArgument = {
  name: string,
  typ: ?Typ.t,
};

export type Fun = {
  arguments: FunArgument[],
  body: t,
  returnTyp: ?Typ.t,
  typParameters: string[],
};

type RecordField = {
  name: string,
  value: t,
};

export const tt: t = {
  type: "Variable",
  name: "tt",
};

function* getObjectPropertyName(
  property: BabelAst.ObjectProperty,
): Monad.t<string> {
  return yield* Typ.getObjectKeyName(property.key);
}

function* getLeftValueRecordFields(
  pattern: BabelAst.ObjectPattern,
): Monad.t<LeftValueRecordField[]> {
  return yield* Monad.all(
    pattern.properties.map(function*(property) {
      switch (property.type) {
        case "ObjectProperty":
          switch (property.value.type) {
            case "Identifier": {
              const {value} = property;

              return {
                name: yield* getObjectPropertyName(property),
                variable: Identifier.compile(value),
              };
            }
            default:
              return yield* Monad.raise<LeftValueRecordField>(
                property.value,
                "Expected an identifier",
              );
          }
        case "RestElement":
          return yield* Monad.raise<LeftValueRecordField>(
            property,
            "Unhandled rest element for record destructuring",
          );
        /* istanbul ignore next */
        default:
          return property;
      }
    }),
  );
}

function* compileLVal(lval: BabelAst.LVal): Monad.t<LeftValue> {
  switch (lval.type) {
    case "ArrayPattern":
      return yield* Monad.raise<LeftValue>(lval, "Unhandled array patterns");
    /* istanbul ignore next */
    case "AssignmentPattern":
      return yield* Monad.raise<LeftValue>(
        lval,
        "Unexpected assignment patterns",
      );
    case "Identifier":
      return {
        type: "Variable",
        name: Identifier.compile(lval),
      };
    /* istanbul ignore next */
    case "MemberExpression":
      return yield* Monad.raise<LeftValue>(lval, "Unexpected member access");
    case "ObjectPattern": {
      const typName = lval.typeAnnotation
        ? yield* Typ.compileIdentifier(lval.typeAnnotation.typeAnnotation)
        : yield* Monad.raise<string>(
            lval,
            "Expected a type annotation for record destructuring",
          );
      const fields = yield* getLeftValueRecordFields(lval);

      return {
        type: "Record",
        fields,
        record: typName,
      };
    }
    /* istanbul ignore next */
    case "RestElement":
      return yield* Monad.raise<LeftValue>(lval, "Unexpected rest elements");
    /* istanbul ignore next */
    default:
      return lval;
  }
}

function* getStringOfStringLiteral(
  expression: BabelAst.Expression,
): Monad.t<string> {
  switch (expression.type) {
    case "StringLiteral":
      return expression.value;
    default:
      return yield* Monad.raise<string>(
        expression,
        "Expected a string literal",
      );
  }
}

function isEmptyDefaultBranch(statements: BabelAst.Statement[]): boolean {
  if (statements.length >= 1) {
    const statement = statements[0];
    switch (statement.type) {
      case "BlockStatement":
        return isEmptyDefaultBranch(statement.body);
      case "ReturnStatement":
        if (statement.argument) {
          switch (statement.argument.type) {
            case "TypeCastExpression":
              switch (statement.argument.typeAnnotation.typeAnnotation.type) {
                case "EmptyTypeAnnotation":
                  return true;
                default:
                  return false;
              }
            default:
              return false;
          }
        }
        return false;
      default:
        return false;
    }
  }

  return false;
}

type FieldsDestructuringFromHeadStatement = {
  fields: LeftValueRecordField[],
  trailingStatements: BabelAst.Statement[],
};

function* getFieldsDestructuringFromHeadStatement(
  statements: BabelAst.Statement[],
  discriminantName: string,
): Monad.t<FieldsDestructuringFromHeadStatement> {
  const noDestructuring = {fields: [], trailingStatements: statements};

  if (statements.length === 0) {
    return noDestructuring;
  }

  const headStatement = statements[0];

  switch (headStatement.type) {
    case "BlockStatement":
      return yield* getFieldsDestructuringFromHeadStatement(
        [...headStatement.body, ...statements.slice(1)],
        discriminantName,
      );
    case "VariableDeclaration": {
      if (headStatement.declarations.length !== 1) {
        return yield* Monad.raise<FieldsDestructuringFromHeadStatement>(
          headStatement,
          "Expected a single definition of variable",
        );
      }

      const declaration = headStatement.declarations[0];

      if (declaration.init) {
        switch (declaration.init.type) {
          case "Identifier": {
            const {name} = declaration.init;

            if (name === discriminantName) {
              switch (declaration.id.type) {
                case "ObjectPattern": {
                  const fields = yield* getLeftValueRecordFields(
                    declaration.id,
                  );

                  return {
                    fields,
                    trailingStatements: statements.slice(1),
                  };
                }
                default:
                  return yield* Monad.raise<FieldsDestructuringFromHeadStatement>(
                    declaration.id,
                    "Expected an object pattern to destructure a sum type",
                  );
              }
            }

            return noDestructuring;
          }
          default:
            return noDestructuring;
        }
      }

      return noDestructuring;
    }
    default:
      return noDestructuring;
  }
}

export function* compileStatements(
  statements: BabelAst.Statement[],
): Monad.t<t> {
  if (statements.length === 0) {
    return tt;
  }

  const statement = statements[0];

  switch (statement.type) {
    case "BlockStatement":
      return yield* compileStatements([
        ...statement.body,
        ...statements.slice(1),
      ]);
    case "ReturnStatement":
      return statement.argument ? yield* compile(statement.argument) : tt;
    case "SwitchStatement":
      switch (statement.discriminant.type) {
        // Destructuring of sum type.
        case "MemberExpression": {
          const {discriminant} = statement;
          const field = yield* Typ.getObjectKeyName(discriminant.property);

          if (field !== "type") {
            return yield* Monad.raise<t>(
              discriminant.property,
              "Expected an access on the `type` field to destructure a sum type",
            );
          }

          switch (discriminant.object.type) {
            case "TypeCastExpression": {
              const {expression, typeAnnotation} = discriminant.object;
              const sum = yield* Typ.compileIdentifier(
                typeAnnotation.typeAnnotation,
              );

              switch (expression.type) {
                case "Identifier": {
                  const discriminantName = expression.name;
                  const branches = yield* Monad.filterMap(
                    statement.cases,
                    function*({consequent, test}) {
                      if (!test) {
                        return null;
                      }

                      const {
                        fields,
                        trailingStatements,
                      } = yield* getFieldsDestructuringFromHeadStatement(
                        consequent,
                        discriminantName,
                      );

                      return {
                        body: yield* compileStatements(trailingStatements),
                        fields,
                        name: yield* getStringOfStringLiteral(test),
                      };
                    },
                  );
                  const defaultCase =
                    statement.cases.find(
                      branch =>
                        !branch.test &&
                        !isEmptyDefaultBranch(branch.consequent),
                    ) || null;

                  return {
                    type: "SumDestruct",
                    branches,
                    defaultBranch:
                      defaultCase &&
                      (yield* compileStatements(defaultCase.consequent)),
                    discriminant: yield* compile(expression),
                    sum,
                  };
                }
                default:
                  return yield* Monad.raise<t>(
                    expression,
                    "Expected a switch on an identifier to destructure a sum type",
                  );
              }
            }
            default:
              return yield* Monad.raise<t>(
                discriminant.object,
                "Expected a type annotation on this expression to destructure a sum type",
              );
          }
        }
        // Destructuring of enum.
        case "TypeCastExpression": {
          const {expression, typeAnnotation} = statement.discriminant;
          const {accumulatedNames, branches} = yield* Monad.reduce<
            {
              accumulatedNames: string[],
              branches: {body: t, names: string[]}[],
            },
            BabelAst.SwitchCase,
          >(statement.cases, {accumulatedNames: [], branches: []}, function*(
            {accumulatedNames, branches},
            branch,
          ) {
            if (!branch.test) {
              return {accumulatedNames: [], branches};
            }

            const name = yield* getStringOfStringLiteral(branch.test);
            const currentAccumulatedNames = [...accumulatedNames, name];

            if (branch.consequent.length === 0) {
              return {accumulatedNames: currentAccumulatedNames, branches};
            }

            return {
              accumulatedNames: [],
              branches: [
                ...branches,
                {
                  body: yield* compileStatements(branch.consequent),
                  names: currentAccumulatedNames,
                },
              ],
            };
          });
          const defaultCase =
            statement.cases.find(
              branch =>
                !branch.test && !isEmptyDefaultBranch(branch.consequent),
            ) || null;

          return {
            type: "EnumDestruct",
            branches: [
              ...branches,
              ...(accumulatedNames.length !== 0
                ? [{body: tt, names: accumulatedNames}]
                : []),
            ],
            defaultBranch:
              defaultCase && (yield* compileStatements(defaultCase.consequent)),
            discriminant: yield* compile(expression),
            typName: yield* Typ.compileIdentifier(
              typeAnnotation.typeAnnotation,
            ),
          };
        }
        default:
          return yield* Monad.raise<t>(
            statement.discriminant,
            "Missing type annotation to destructure an enum",
          );
      }
    case "VariableDeclaration": {
      if (statement.declarations.length !== 1) {
        return yield* Monad.raise<t>(
          statement,
          "Expected exactly one definition",
        );
      }

      const declaration = statement.declarations[0];

      return {
        type: "Let",
        body: yield* compileStatements(statements.slice(1)),
        lval: yield* compileLVal(declaration.id),
        value: declaration.init
          ? yield* compile(declaration.init)
          : yield* Monad.raise<t>(
              declaration,
              "Expected a definition with a value",
            ),
      };
    }
    default:
      return yield* Monad.raiseUnhandled<t>(statement);
  }
}

export function* compileFun(
  fun:
    | BabelAst.FunctionDeclaration
    | BabelAst.FunctionExpression
    | BabelAst.ArrowFunctionExpression,
): Monad.t<Fun> {
  const returnTyp = fun.returnType ? fun.returnType.typeAnnotation : null;

  return {
    arguments: yield* Monad.all(
      fun.params.map(function*(param) {
        switch (param.type) {
          case "Identifier":
            return {
              name: param.name,
              typ: param.typeAnnotation
                ? yield* Typ.compile(param.typeAnnotation.typeAnnotation)
                : null,
            };
          default:
            return yield* Monad.raise<FunArgument>(
              param,
              "Expected simple identifier as function parameter",
            );
        }
      }),
    ),
    body:
      fun.body.type === "BlockStatement"
        ? yield* compileStatements(fun.body.body)
        : yield* compile(fun.body),
    returnTyp: returnTyp && (yield* Typ.compile(returnTyp)),
    typParameters: fun.typeParameters
      ? Util.filterMap(fun.typeParameters.params, param => param.name)
      : [],
  };
}

export function* compile(expression: BabelAst.Expression): Monad.t<t> {
  switch (expression.type) {
    case "ArrayExpression":
      return {
        type: "ArrayExpression",
        elements: expression.elements
          ? yield* Monad.all(
              expression.elements.map(function*(element) {
                if (!element) {
                  return yield* Monad.raise<t>(
                    expression,
                    "Expected non-empty elements in the array",
                  );
                }

                if (element.type === "SpreadElement") {
                  return yield* Monad.raise<t>(
                    element,
                    "Spreads in arrays are not handled",
                  );
                }

                return yield* compile(element);
              }),
            )
          : /* istanbul ignore next */
            yield* Monad.raise<t[]>(
              expression,
              "Unexpected empty array expression",
            ),
      };
    case "ArrowFunctionExpression":
      return {
        type: "FunctionExpression",
        value: yield* compileFun(expression),
      };
    case "BinaryExpression":
      return {
        type: "BinaryExpression",
        left: yield* compile(expression.left),
        operator: expression.operator,
        right: yield* compile(expression.right),
      };
    case "BooleanLiteral":
      return {
        type: "Constant",
        value: expression.value,
      };
    case "CallExpression":
      return {
        type: "CallExpression",
        arguments: yield* Monad.all(
          expression.arguments.map(function*(argument) {
            switch (argument.type) {
              case "ArgumentPlaceholder":
                return yield* Monad.raise<t>(
                  argument,
                  "Unhandled partial application",
                );
              case "SpreadElement":
                return yield* Monad.raise<t>(
                  argument,
                  "Unhandled spread parameters",
                );
              default:
                return yield* compile(argument);
            }
          }),
        ),
        callee: yield* compile(expression.callee),
      };
    case "ConditionalExpression":
      return {
        type: "ConditionalExpression",
        alternate: yield* compile(expression.alternate),
        consequent: yield* compile(expression.consequent),
        test: yield* compile(expression.test),
      };
    case "FunctionExpression":
      return {
        type: "FunctionExpression",
        value: yield* compileFun(expression),
      };
    case "Identifier":
      return {
        type: "Variable",
        name: expression.name,
      };
    case "LogicalExpression":
      return {
        type: "BinaryExpression",
        left: yield* compile(expression.left),
        operator: expression.operator,
        right: yield* compile(expression.right),
      };
    case "MemberExpression": {
      switch (expression.object.type) {
        case "TypeCastExpression": {
          const {expression: object, typeAnnotation} = expression.object;
          const record = yield* Typ.compileIdentifier(
            typeAnnotation.typeAnnotation,
          );
          const field = yield* Typ.getObjectKeyName(expression.property);

          return {
            type: "RecordProjection",
            field,
            object: yield* compile(object),
            record,
          };
        }
        default:
          return yield* Monad.raise<t>(
            expression.object,
            "Expected a type annotation on this object to access a member",
          );
      }
    }
    case "NullLiteral":
      return tt;
    case "NumericLiteral":
      return {
        type: "Constant",
        value: expression.value,
      };
    case "ObjectExpression": {
      if (expression.properties.length === 0) {
        return tt;
      }

      return yield* Monad.raise<t>(
        expression,
        "Unhandled object expression without type annotation",
      );
    }
    /* istanbul ignore next */
    case "ParenthesizedExpression":
      return yield* compile(expression.expression);
    case "StringLiteral":
      return {
        type: "Constant",
        value: expression.value,
      };
    case "TypeCastExpression": {
      switch (expression.expression.type) {
        case "ObjectExpression": {
          const [names, fields] = yield* Monad.reduce(
            expression.expression.properties,
            [[], []],
            function*([names, fields], property) {
              if (property.type !== "ObjectProperty") {
                return yield* Monad.raise<[*, *]>(
                  property,
                  "Expected a named property",
                );
              }

              if (property.computed) {
                return yield* Monad.raise<[*, *]>(
                  property.key,
                  "Unhandled computed property name",
                );
              }

              const name = yield* getObjectPropertyName(property);
              // Because this seems to be the case here and for
              // performance reasons for the type checking.
              const value: BabelAst.Expression = (property.value: any);

              if (name === "type") {
                return [
                  [...names, yield* getStringOfStringLiteral(value)],
                  fields,
                ];
              }

              return [names, [...fields, {name, value: yield* compile(value)}]];
            },
          );
          const typName = yield* Typ.compileIdentifier(
            expression.typeAnnotation.typeAnnotation,
          );

          return names.length === 0
            ? {type: "RecordInstance", record: typName, fields}
            : {
                type: "SumInstance",
                constr: names[0],
                fields,
                sum: typName,
              };
        }
        case "StringLiteral": {
          const {value} = expression.expression;

          return {
            type: "EnumInstance",
            instance: value,
            typName: yield* Typ.compileIdentifier(
              expression.typeAnnotation.typeAnnotation,
            ),
          };
        }
        default:
          return {
            type: "TypeCastExpression",
            expression: yield* compile(expression.expression),
            typeAnnotation: yield* Typ.compile(
              expression.typeAnnotation.typeAnnotation,
            ),
          };
      }
    }
    case "UnaryExpression":
      return {
        type: "UnaryExpression",
        argument: yield* compile(expression.argument),
        operator: expression.operator,
      };
    default:
      return yield* Monad.raiseUnhandled<t>(expression);
  }
}

export function printFunArguments(funArguments: FunArgument[]): Doc.t {
  return Doc.concat(
    funArguments.map(({name, typ}) =>
      Doc.concat([
        Doc.line,
        typ
          ? Doc.group(
              Doc.concat([
                "(",
                name,
                Doc.line,
                ":",
                Doc.line,
                Typ.print(typ),
                ")",
              ]),
            )
          : name,
      ]),
    ),
  );
}

function printRecordInstance(
  record: string,
  fields: {name: string, value: Doc.t}[],
): Doc.t {
  return Doc.group(
    Doc.concat([
      "{|",
      Doc.indent(
        Doc.concat(
          fields.map(({name, value}) =>
            Doc.concat([
              Doc.line,
              Doc.group(
                Doc.concat([
                  Doc.group(Doc.concat([`${record}.${name}`, Doc.line, ":="])),
                  Doc.indent(Doc.concat([Doc.line, value, ";"])),
                ]),
              ),
            ]),
          ),
        ),
      ),
      Doc.line,
      "|}",
    ]),
  );
}

function printLeftValue(lval: LeftValue, withQuote: boolean): Doc.t {
  switch (lval.type) {
    case "Record":
      if (lval.fields.length === 0) {
        return "_";
      }

      return Doc.concat([
        ...(withQuote ? ["'"] : []),
        printRecordInstance(
          lval.record,
          lval.fields.map(({name, variable}) => ({name, value: variable})),
        ),
      ]);
    case "Variable":
      return lval.name;
    /* istanbul ignore next */
    default:
      return lval;
  }
}

function printMatch(
  discriminant: Doc.t,
  branches: {
    body: Doc.t,
    patterns: {
      fields: ?(LeftValueRecordField[]),
      name: string,
    }[],
  }[],
  defaultBranch: ?Doc.t,
  typName: string,
): Doc.t {
  return Doc.group(
    Doc.concat([
      Doc.group(
        Doc.concat(["match", Doc.line, discriminant, Doc.line, "with"]),
      ),
      Doc.hardline,
      ...branches.map(({body, patterns}) =>
        Doc.group(
          Doc.concat([
            Doc.join(
              Doc.line,
              patterns.map(({fields, name}) =>
                Doc.group(
                  Doc.concat([
                    "|",
                    Doc.line,
                    `${typName}.${name}`,
                    ...(fields
                      ? [
                          Doc.line,
                          printLeftValue(
                            {
                              type: "Record",
                              fields,
                              record: `${typName}.${name}`,
                            },
                            false,
                          ),
                        ]
                      : []),
                  ]),
                ),
              ),
            ),
            Doc.line,
            "=>",
            Doc.indent(Doc.concat([Doc.line, body])),
            Doc.hardline,
          ]),
        ),
      ),
      ...(defaultBranch
        ? [
            Doc.group(
              Doc.concat([
                Doc.group(Doc.concat(["|", Doc.line, "_", Doc.line, "=>"])),
                Doc.indent(Doc.concat([Doc.line, defaultBranch])),
                Doc.hardline,
              ]),
            ),
          ]
        : []),
      "end",
    ]),
  );
}

export function print(needParens: boolean, expression: t): Doc.t {
  switch (expression.type) {
    case "ArrayExpression":
      if (expression.elements.length === 0) {
        return "[]";
      }

      return Doc.group(
        Doc.concat([
          "[",
          Doc.indent(
            Doc.concat([
              Doc.line,
              Doc.join(
                Doc.concat([";", Doc.line]),
                expression.elements.map(element => print(false, element)),
              ),
            ]),
          ),
          Doc.line,
          "]",
        ]),
      );
    case "BinaryExpression":
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.join(Doc.line, [
            print(true, expression.left),
            expression.operator,
            print(true, expression.right),
          ]),
        ),
      );
    case "CallExpression":
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.indent(
            Doc.join(Doc.line, [
              print(true, expression.callee),
              ...expression.arguments.map(argument => print(true, argument)),
            ]),
          ),
        ),
      );
    case "ConditionalExpression": {
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.concat([
            Doc.group(
              Doc.concat([
                "if",
                Doc.line,
                print(false, expression.test),
                Doc.line,
                "then",
              ]),
            ),
            Doc.indent(
              Doc.concat([Doc.line, print(false, expression.consequent)]),
            ),
            Doc.line,
            "else",
            Doc.indent(
              Doc.concat([Doc.line, print(false, expression.alternate)]),
            ),
          ]),
        ),
      );
    }
    case "Constant":
      return JSON.stringify(expression.value);
    case "EnumDestruct": {
      const {branches, defaultBranch, discriminant, typName} = expression;

      return printMatch(
        print(false, discriminant),
        branches.map(({body, names}) => ({
          body: print(false, body),
          patterns: names.map(name => ({fields: null, name})),
        })),
        defaultBranch && print(false, defaultBranch),
        typName,
      );
    }
    case "EnumInstance":
      return `${expression.typName}.${expression.instance}`;
    case "FunctionExpression":
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.concat([
            Doc.group(
              Doc.concat([
                "fun",
                Doc.indent(
                  Doc.concat([
                    ...(expression.value.typParameters.length !== 0
                      ? [
                          Doc.line,
                          Typ.printImplicitTyps(expression.value.typParameters),
                        ]
                      : []),
                    printFunArguments(expression.value.arguments),
                  ]),
                ),
                Doc.line,
                "=>",
              ]),
            ),
            Doc.indent(
              Doc.concat([Doc.line, print(false, expression.value.body)]),
            ),
          ]),
        ),
      );
    case "Let":
      return Doc.group(
        Doc.concat([
          Doc.group(
            Doc.concat([
              "let",
              Doc.line,
              printLeftValue(expression.lval, true),
              Doc.line,
              ":=",
            ]),
          ),
          Doc.indent(Doc.concat([Doc.line, print(false, expression.value)])),
          Doc.line,
          "in",
          Doc.hardline,
          print(false, expression.body),
        ]),
      );
    case "RecordInstance":
      return printRecordInstance(
        expression.record,
        expression.fields.map(({name, value}) => ({
          name,
          value: print(false, value),
        })),
      );
    case "RecordProjection":
      return Doc.group(
        Doc.concat([
          print(true, expression.object),
          Doc.softline,
          ".(",
          Doc.indent(
            Doc.group(
              Doc.concat([
                Doc.softline,
                expression.record,
                ".",
                expression.field,
              ]),
            ),
          ),
          Doc.softline,
          ")",
        ]),
      );
    case "SumDestruct": {
      const {branches, defaultBranch, discriminant, sum} = expression;

      return printMatch(
        print(false, discriminant),
        branches.map(({body, fields, name}) => ({
          body: print(false, body),
          patterns: [{fields, name}],
        })),
        defaultBranch && print(false, defaultBranch),
        sum,
      );
    }
    case "SumInstance": {
      const name = `${expression.sum}.${expression.constr}`;

      return Doc.paren(
        needParens,
        Doc.group(
          Doc.concat([
            name,
            Doc.line,
            ...(expression.fields.length !== 0
              ? [
                  printRecordInstance(
                    name,
                    expression.fields.map(({name, value}) => ({
                      name,
                      value: print(false, value),
                    })),
                  ),
                ]
              : ["tt"]),
          ]),
        ),
      );
    }
    case "TypeCastExpression":
      return Doc.group(
        Doc.concat([
          "(",
          Doc.softline,
          print(true, expression.expression),
          Doc.line,
          ":",
          Doc.line,
          Typ.print(expression.typeAnnotation),
          Doc.softline,
          ")",
        ]),
      );
    case "UnaryExpression":
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.concat([
            expression.operator,
            Doc.line,
            print(true, expression.argument),
          ]),
        ),
      );
    case "Variable":
      return expression.name;
    /* istanbul ignore next */
    default:
      return expression;
  }
}
