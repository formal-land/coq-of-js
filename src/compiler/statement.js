// @flow
import * as Doc from "./doc.js";
import * as Expression from "./expression.js";
import * as Typ from "./typ.js";

export type t = {
  type: "Definition",
  arguments: {name: string, typ: Typ.t}[],
  body: Expression.t,
  name: string,
  returnTyp: ?Typ.t,
  typParameters: string[],
};

export function compile(statement: any): t[] {
  switch (statement.type) {
    case "FunctionDeclaration": {
      const returnTyp = statement.returnType ? statement.returnType.typeAnnotation : null;

      return [{
        type: "Definition",
        arguments: statement.params.map(({name, typeAnnotation}) => ({
          name,
          typ: Typ.compile(typeAnnotation.typeAnnotation)
        })),
        body: Expression.compile(statement.body.body[0].argument),
        name: statement.id.name,
        returnTyp: returnTyp && Typ.compile(returnTyp),
        typParameters: statement.typeParameters ? statement.typeParameters.params.map(param => param.name) : [],
      }];
    }
    case "VariableDeclaration":
      return statement.declarations.map(declaration => {
        const returnTyp = declaration.id.typeAnnotation ? declaration.id.typeAnnotation.typeAnnotation : null;

        return {
          type: "Definition",
          arguments: [],
          body: Expression.compile(declaration.init),
          name: declaration.id.name,
          returnTyp: returnTyp && Typ.compile(returnTyp),
          typParameters: [],
        };
      });
    default:
      throw new Error(JSON.stringify(statement, null, 2));
  }
}

export function print(statement: t): Doc.t {
  switch (statement.type) {
    case "Definition":
      return Doc.group(Doc.concat(
        [
          Doc.group(Doc.concat(["Definition", Doc.line, statement.name])),
          Doc.indent(
            Doc.concat(
              [
                ...(statement.typParameters.length !== 0
                  ? [Doc.line, Doc.group(Doc.concat(["{", Doc.join(Doc.line, statement.typParameters), "}"]))]
                  : []
                ),
                ...statement.arguments.map(({name, typ}) =>
                  Doc.concat([Doc.line, Doc.group(Doc.concat(["(", name, ":", Doc.line, Typ.print(typ), ")"]))])
                ),
                Doc.softline,
                Doc.group(
                  Doc.concat([
                    ...(statement.returnTyp
                      ? [":", Doc.line, Typ.print(statement.returnTyp)]
                      : []
                    ),
                    Doc.line,
                    ":=",
                  ])
                ),
                Doc.hardline,
                Expression.print(statement.body),
                "."
              ]
            )
          ),
        ]
      ));
    default:
      return statement;
  }
}
