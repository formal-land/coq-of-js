// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Monad from "./monad.js";

export type t = {
  type: "Variable",
  name: string,
};

function compileIdentifierOrQualifiedTypeIdentifier(
  id: BabelAst.Identifier | BabelAst.QualifiedTypeIdentifier
): string {
  switch (id.type) {
    case "Identifier":
      return id.name;
    case "QualifiedTypeIdentifier":
      return id.id.name;
    default:
      return id;
  }
}

export function* compile(typ: BabelAst.FlowType): Monad.t<t> {
  switch (typ.type) {
    case "BooleanTypeAnnotation":
      return {
        type: "Variable",
        name: "bool",
      };
    case "GenericTypeAnnotation":
      return {
        type: "Variable",
        name: compileIdentifierOrQualifiedTypeIdentifier(typ.id),
      };
    case "NumberTypeAnnotation":
      return {
        type: "Variable",
        name: "Z",
      };
    case "StringTypeAnnotation":
      return {
        type: "Variable",
        name: "string",
      };
    default:
      return yield* Monad.raiseUnhandled<t>(typ);
  }
}

export function printImplicitTyps(names: string[]): Doc.t {
  return Doc.group(
    Doc.concat([
      "{",
      Doc.indent(
        Doc.concat([
          Doc.softline,
          Doc.join(Doc.line, names),
          Doc.line,
          Doc.group(Doc.concat([":", Doc.line, "Type"])),
        ])
      ),
      Doc.softline,
      "}",
    ])
  );
}

export function print(typ: t): Doc.t {
  switch (typ.type) {
    case "Variable":
      return typ.name;
    default:
      return typ;
  }
}

export function printReturnTyp(typ: ?t, nextToken: Doc.t): Doc.t {
  return Doc.group(
    Doc.concat([
      ...(typ
        ? [":", Doc.line, print(typ), Doc.line]
        : []
      ),
      nextToken,
    ])
  );
}
