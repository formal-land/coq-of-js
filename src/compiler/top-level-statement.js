// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Expression from "./expression.js";
import * as Identifier from "./identifier.js";
import * as Monad from "./monad.js";
import * as Typ from "./typ.js";
import * as TypDefinition from "./typ-definition.js";

export type t =
  | {
      type: "Definition",
      arguments: Expression.FunArgument[],
      body: Expression.t,
      name: string,
      returnTyp: ?Typ.t,
      typParameters: string[],
    }
  | {
      type: "TypeDefinition",
      name: string,
      typDefinition: TypDefinition.t,
    };

function* extractIdentifierOfLVal(
  lval: BabelAst.LVal,
): Monad.t<BabelAst.Identifier> {
  switch (lval.type) {
    case "Identifier":
      return lval;
    default:
      return yield* Monad.raise<BabelAst.Identifier>(
        lval,
        "Expected simple identifier",
      );
  }
}

export function* compile(declaration: BabelAst.Statement): Monad.t<t[]> {
  switch (declaration.type) {
    case "ExportNamedDeclaration":
      return declaration.declaration
        ? yield* compile(declaration.declaration)
        : yield* Monad.raise<t[]>(declaration, "Expected a declaration");
    case "FunctionDeclaration": {
      const fun = yield* Expression.compileFun(declaration);
      const name = declaration.id
        ? declaration.id.name
        : yield* Monad.raise<string>(declaration, "Expected named function");

      return [
        {
          type: "Definition",
          arguments: fun.arguments,
          body: fun.body,
          name,
          returnTyp: fun.returnTyp,
          typParameters: fun.typParameters,
        },
      ];
    }
    case "ImportDeclaration": {
      if (declaration.source.value === "react") {
        return [];
      }

      return yield* Monad.raise<t[]>(
        declaration,
        "Only handle imports from React for now",
      );
    }
    case "TypeAlias":
      return [
        {
          type: "TypeDefinition",
          name: Identifier.compile(declaration.id),
          typDefinition: yield* TypDefinition.compile(declaration.right),
        },
      ];
    case "VariableDeclaration":
      return yield* Monad.all(
        declaration.declarations.map(function*(declaration) {
          const id = yield* extractIdentifierOfLVal(declaration.id);
          const returnTyp = id.typeAnnotation
            ? id.typeAnnotation.typeAnnotation
            : null;

          return {
            type: "Definition",
            arguments: [],
            body: declaration.init
              ? yield* Expression.compile(declaration.init)
              : yield* Monad.raise<Expression.t>(
                  declaration,
                  "Expected definition",
                ),
            name: id.name,
            returnTyp: returnTyp && (yield* Typ.compile(returnTyp)),
            typParameters: [],
          };
        }),
      );
    default:
      return yield* Monad.raiseUnhandled<t[]>(declaration);
  }
}

export function print(declaration: t): Doc.t {
  switch (declaration.type) {
    case "Definition":
      return Doc.group(
        Doc.concat([
          Doc.group(Doc.concat(["Definition", Doc.line, declaration.name])),
          Doc.indent(
            Doc.concat([
              ...(declaration.typParameters.length !== 0
                ? [Doc.line, Typ.printImplicitTyps(declaration.typParameters)]
                : []),
              Expression.printFunArguments(declaration.arguments),
              Doc.line,
              Typ.printReturnTyp(declaration.returnTyp, ":="),
              Doc.hardline,
              Expression.print(false, declaration.body),
              ".",
            ]),
          ),
        ]),
      );
    case "TypeDefinition":
      return TypDefinition.print(declaration.name, declaration.typDefinition);
    default:
      return declaration;
  }
}
