// @flow
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
        typParameters: statement.typeParameters.params.map(param => param.name),
      };
    default:
      throw new Error(JSON.stringify(statement, null, 2));
  }
}
