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
    case "BlockStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Blocks are not handled at top-level",
      );
    // `break` is forbidden at top-level.
    /* istanbul ignore next */
    case "BreakStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Unexpected `break` at top-level",
      );
    case "ClassDeclaration":
      return yield* Monad.raise<t[]>(
        declaration,
        "Class declarations are not handled",
      );
    // `continue` is forbidden at top-level.
    /* istanbul ignore next */
    case "ContinueStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Unexpected `continue` at top-level",
      );
    case "DebuggerStatement":
      return [];
    case "DeclareClass":
    case "DeclareExportAllDeclaration":
    case "DeclareExportDeclaration":
    case "DeclareFunction":
    case "DeclareInterface":
    case "DeclareModule":
    case "DeclareModuleExports":
    case "DeclareOpaqueType":
    case "DeclareTypeAlias":
    case "DeclareVariable":
      // We choose to ignore the concept of declaration for now, as we believe
      // that everything should be public to do proofs.
      return [];
    case "DoWhileStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Do-while loops are not handled",
      );
    case "EmptyStatement":
      return [];
    case "ExportAllDeclaration":
      return yield* Monad.raise<t[]>(declaration, "Export all are not handled");
    case "ExportDefaultDeclaration":
      return yield* Monad.raise<t[]>(
        declaration,
        "Export default is not handled",
      );
    case "ExportNamedDeclaration":
      return declaration.declaration
        ? yield* compile(declaration.declaration)
        : yield* Monad.raise<t[]>(
            declaration,
            "This kind of export is not handled",
          );
    case "ExpressionStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Top-level expressions are not handled",
      );
    case "ForInStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "For-in loops are not handled",
      );
    case "ForOfStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "For-of loops are not handled",
      );
    case "ForStatement":
      return yield* Monad.raise<t[]>(declaration, "For loops are not handled");
    case "FunctionDeclaration": {
      const fun = yield* Expression.compileFun(declaration);
      const name = declaration.id
        ? declaration.id.name
        : // A top-level function always has a name.
          /* istanbul ignore next */
          yield* Monad.raise<string>(declaration, "Expected named function");

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
    case "IfStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "If at top-level are not handled",
      );
    case "ImportDeclaration": {
      if (declaration.source.value === "react") {
        return [];
      }

      return yield* Monad.raise<t[]>(
        declaration,
        "Only the imports from React are handled",
      );
    }
    case "InterfaceDeclaration":
      return yield* Monad.raise<t[]>(
        declaration,
        "Interface declarations are not handled",
      );
    case "LabeledStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Labeled statements are not handled",
      );
    case "OpaqueType":
      return [
        {
          type: "TypeDefinition",
          name: Identifier.compile(declaration.id),
          typDefinition: yield* TypDefinition.compile(declaration.impltype),
        },
      ];
    // `return` is forbidden at top-level.
    /* istanbul ignore next */
    case "ReturnStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Unexpected `return` at top-level",
      );
    case "SwitchStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Top-level switch are not handled",
      );
    case "ThrowStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Throw statements are not handled",
      );
    case "TryStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "Try statements are not handled",
      );
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
    case "WhileStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "While loops are not handled",
      );
    // The `with` keyword is forbidden as we are in strict mode.
    /* istanbul ignore next */
    case "WithStatement":
      return yield* Monad.raise<t[]>(
        declaration,
        "With statements are not handled",
      );
    /* istanbul ignore next */
    default:
      return declaration;
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
    /* istanbul ignore next */
    default:
      return declaration;
  }
}
