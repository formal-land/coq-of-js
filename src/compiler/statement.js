// @flow
import * as Doc from "./doc.js";
import * as Expression from "./expression.js";
import * as Monad from "./monad.js";
import * as Typ from "./typ.js";

export type t = {
  type: "Definition",
  arguments: {name: string, typ: Typ.t}[],
  body: Expression.t,
  name: string,
  returnTyp: ?Typ.t,
  typParameters: string[],
};

export function* compile(statement: any): Monad.t<t[]> {
  switch (statement.type) {
    case "FunctionDeclaration": {
      const returnTyp = statement.returnType ? statement.returnType.typeAnnotation : null;

      return [{
        type: "Definition",
        arguments: yield* Monad.all(statement.params.map(function*({name, typeAnnotation}) {
          return {
            name,
            typ: yield* Typ.compile(typeAnnotation.typeAnnotation),
          };
        })),
        body: yield* Expression.compile(statement.body.body[0].argument),
        name: statement.id.name,
        returnTyp: returnTyp && (yield* Typ.compile(returnTyp)),
        typParameters: statement.typeParameters ? statement.typeParameters.params.map(param => param.name) : [],
      }];
    }
    case "VariableDeclaration":
      return yield* Monad.all(statement.declarations.map(function*(declaration) {
        const returnTyp = declaration.id.typeAnnotation ? declaration.id.typeAnnotation.typeAnnotation : null;

        return {
          type: "Definition",
          arguments: [],
          body: Expression.compile(declaration.init),
          name: declaration.id.name,
          returnTyp: returnTyp && (yield* Typ.compile(returnTyp)),
          typParameters: [],
        };
      }));
    default:
      return yield* Monad.raise(JSON.stringify(statement, null, 2));
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
