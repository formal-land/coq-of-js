// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Identifier from "./identifier.js";
import * as Monad from "./monad.js";

export type t = {
  type: "Variable",
  name: string,
};

function compileIdentifierOrQualifiedTypeIdentifier(
  id: BabelAst.Identifier | BabelAst.QualifiedTypeIdentifier,
): string {
  switch (id.type) {
    case "Identifier":
      return Identifier.compile(id);
    case "QualifiedTypeIdentifier":
      return Identifier.compile(id.id);
    /* istanbul ignore next */
    default:
      return id;
  }
}

export function* compileIdentifier(typ: BabelAst.FlowType): Monad.t<string> {
  switch (typ.type) {
    case "GenericTypeAnnotation":
      return compileIdentifierOrQualifiedTypeIdentifier(typ.id);
    default:
      return yield* Monad.raise<string>(typ, "Expected a type identifier");
  }
}

export function* compileIfHandled(typ: BabelAst.FlowType): Monad.t<?t> {
  switch (typ.type) {
    case "BooleanLiteralTypeAnnotation":
      return yield* Monad.raise<?t>(
        typ,
        "Boolean literals in types are not handled",
      );
    case "BooleanTypeAnnotation":
      return {
        type: "Variable",
        name: "bool",
      };
    case "EmptyTypeAnnotation":
      return {
        type: "Variable",
        name: "Empty_set",
      };
    case "GenericTypeAnnotation":
      return {
        type: "Variable",
        name: compileIdentifierOrQualifiedTypeIdentifier(typ.id),
      };
    case "NullLiteralTypeAnnotation":
      return {
        type: "Variable",
        name: "unit",
      };
    case "NumberLiteralTypeAnnotation":
      return yield* Monad.raise<?t>(
        typ,
        "Number literals in types are not handled",
      );
    case "NumberTypeAnnotation":
      return {
        type: "Variable",
        name: "Z",
      };
    case "ObjectTypeAnnotation": {
      if (typ.properties.length === 0) {
        return {
          type: "Variable",
          name: "unit",
        };
      }

      return null;
    }
    case "StringTypeAnnotation":
      return {
        type: "Variable",
        name: "string",
      };
    case "VoidTypeAnnotation":
      return {
        type: "Variable",
        name: "unit",
      };
    default:
      return null;
  }
}

export function* compile(typ: BabelAst.FlowType): Monad.t<t> {
  return (
    (yield* compileIfHandled(typ)) || (yield* Monad.raiseUnhandled<t>(typ))
  );
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
        ]),
      ),
      Doc.softline,
      "}",
    ]),
  );
}

export function print(typ: t): Doc.t {
  switch (typ.type) {
    case "Variable":
      return typ.name;
    /* istanbul ignore next */
    default:
      return typ;
  }
}

export function printReturnTyp(typ: ?t, nextToken: Doc.t): Doc.t {
  return Doc.group(
    Doc.concat([
      ...(typ ? [":", Doc.line, print(typ), Doc.line] : []),
      nextToken,
    ]),
  );
}
