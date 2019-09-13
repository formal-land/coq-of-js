// @flow
import * as Doc from "./doc.js";
import * as Expression from "./expression.js";
import * as Typ from "./typ.js";

export type t = {
  type: "Definition",
  arguments: {name: string, typ: Typ.t}[],
  body: Expression.t,
  name: string,
  returnTyp: Typ.t,
  typParameters: string[];
};

export function compile(statement: any): t {
  switch (statement.type) {
    case "FunctionDeclaration":
      return {
        type: "Definition",
        arguments: statement.params.map(({name, typeAnnotation}) => ({
          name,
          typ: Typ.compile(typeAnnotation.typeAnnotation)
        })),
        body: Expression.compile(statement.body.body[0].argument),
        name: statement.id.name,
        returnTyp: Typ.compile(statement.returnType.typeAnnotation),
        typParameters: statement.typeParameters ? statement.typeParameters.params.map(param => param.name) : [],
      };
    default:
      throw new Error(JSON.stringify(statement, null, 2));
  }
}

export function print(statement: t): Doc.t {
  switch (statement.type) {
    case "Definition":
      return Doc.group(Doc.concat([
        Doc.group(Doc.concat(["Definition", Doc.line, statement.name])),
        Doc.indent(
          Doc.concat([
            ...(statement.typParameters.length !== 0
              ? [Doc.line, Doc.group(Doc.concat(["{", Doc.join(Doc.line, statement.typParameters)])), "}"]
              : []
            ),
            Doc.line,
            Doc.join(
              Doc.line,
              statement.arguments.map(({name, typ}) =>
                Doc.group(Doc.concat(["(", name, ":", Doc.line, Typ.print(typ), ")"]))
              ),
            ),
            Doc.softline,
            Doc.group(Doc.concat([":", Doc.line, Typ.print(statement.returnTyp), Doc.line, ":="])),
            Doc.hardline,
            Expression.print(statement.body),
            "."
          ])
        ),
      ]));
    default:
      return statement;
  }
}
