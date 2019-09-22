// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Expression from "./expression.js";
import * as Monad from "./monad.js";
import * as Statement from './statement';
import * as Typ from "./typ.js";
import * as Util from "./util.js";

type Argument = {
  name: string,
  typ: Typ.t,
};

export type t = {
  type: "Definition",
  arguments: Argument[],
  body: Expression.t,
  name: string,
  returnTyp: ?Typ.t,
  typParameters: string[],
};

function* extractIdentifierOfLVal(lval: BabelAst.LVal): Monad.t<BabelAst.Identifier> {
  switch (lval.type) {
    case "Identifier":
      return lval;
    default:
      return yield* Monad.raise<BabelAst.Identifier>("Expected identifier");
  }
}

export function* compile(declaration: BabelAst.Statement): Monad.t<t[]> {
  switch (declaration.type) {
    case "FunctionDeclaration": {
      const returnTyp = declaration.returnType ? declaration.returnType.typeAnnotation : null;

      return [{
        type: "Definition",
        arguments: yield* Monad.all(declaration.params.map(function*(param) {
          switch (param.type) {
            case "Identifier":
                return {
                  name: param.name,
                  typ:
                    param.typeAnnotation
                      ? yield* Typ.compile(param.typeAnnotation.typeAnnotation)
                      : yield* Monad.raise<Typ.t>("Expected type annotation"),
                };
            default:
              return yield* Monad.raise<Argument>("Expected simple identifier as function parameter");
          }
        })),
        body: yield* Statement.compile(declaration.body.body),
        name:
          declaration.id
            ? declaration.id.name
            : yield* Monad.raise<string>("Expected named function"),
        returnTyp: returnTyp && (yield* Typ.compile(returnTyp)),
        typParameters: declaration.typeParameters ? Util.filterMap(declaration.typeParameters.params, param => param.name) : [],
      }];
    }
    case "VariableDeclaration":
      return yield* Monad.all(declaration.declarations.map(function*(declaration) {
        const id = yield* extractIdentifierOfLVal(declaration.id);
        const returnTyp = id.typeAnnotation ? id.typeAnnotation.typeAnnotation : null;

        return {
          type: "Definition",
          arguments: [],
          body:
            declaration.init
              ? yield* Expression.compile(declaration.init)
              : yield* Monad.raise<Expression.t>("Expected definition"),
          name: id.name,
          returnTyp: returnTyp && (yield* Typ.compile(returnTyp)),
          typParameters: [],
        };
      }));
    default:
      return yield* Monad.raiseUnhandled<t[]>(declaration);
  }
}

export function print(declaration: t): Doc.t {
  switch (declaration.type) {
    case "Definition":
      return Doc.group(Doc.concat(
        [
          Doc.group(Doc.concat(["Definition", Doc.line, declaration.name])),
          Doc.indent(
            Doc.concat(
              [
                ...(declaration.typParameters.length !== 0
                  ? [Doc.line, Doc.group(Doc.concat(["{", Doc.join(Doc.line, declaration.typParameters), "}"]))]
                  : []
                ),
                ...declaration.arguments.map(({name, typ}) =>
                  Doc.concat([Doc.line, Doc.group(Doc.concat(["(", name, ":", Doc.line, Typ.print(typ), ")"]))])
                ),
                Doc.softline,
                Doc.group(
                  Doc.concat([
                    ...(declaration.returnTyp
                      ? [":", Doc.line, Typ.print(declaration.returnTyp)]
                      : []
                    ),
                    Doc.line,
                    ":=",
                  ])
                ),
                Doc.hardline,
                Expression.print(declaration.body),
                "."
              ]
            )
          ),
        ]
      ));
    default:
      return declaration;
  }
}
