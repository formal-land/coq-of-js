// @flow
import doc from "./doc.js";
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

export function print(statement: t): string {
  switch (statement.type) {
    case "Definition":
      return doc.group(doc.concat([
        doc.group(doc.concat(["Definition", doc.line, statement.name])),
        doc.indent(
          doc.concat([
            ...(statement.typParameters.length !== 0
              ? [doc.line, doc.group(doc.concat(["{", doc.join(doc.line, statement.typParameters)])), "}"]
              : []
            ),
            doc.line,
            doc.join(
              doc.line,
              statement.arguments.map(({name, typ}) =>
                doc.group(doc.concat(["(", name, ":", doc.line, Typ.print(typ), ")"]))
              ),
            ),
            doc.softline,
            doc.group(doc.concat([":", doc.line, Typ.print(statement.returnTyp), doc.line, ":="])),
            doc.hardline,
            Expression.print(statement.body),
            "."
          ])
        ),
      ]));
    default:
      return statement;
  }
}
