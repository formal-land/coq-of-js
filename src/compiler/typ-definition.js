// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Monad from "./monad.js";
import * as Typ from "./typ.js";

export type t =
  | {
      type: "Enum",
      names: string[],
    }
  | {
      type: "Synonym",
      typ: Typ.t,
    };

export function* compile(typ: BabelAst.FlowType): Monad.t<t> {
  const plainTyp = yield* Typ.compileIfHandled(typ);

  if (plainTyp) {
    return {
      type: "Synonym",
      typ: plainTyp,
    };
  }

  switch (typ.type) {
    case "StringLiteralTypeAnnotation":
      return {
        type: "Enum",
        names: [typ.value],
      };
    case "UnionTypeAnnotation": {
      const names = yield* Monad.all(
        typ.types.map(function*(typ) {
          switch (typ.type) {
            case "StringLiteralTypeAnnotation":
              return typ.value;
            default:
              return yield* Monad.raise<string>(
                typ,
                "Only strings are handled in enums",
              );
          }
        }),
      );

      return {
        type: "Enum",
        names,
      };
    }
    default:
      return yield* Monad.raiseUnhandled<t>(typ);
  }
}

export function print(name: string, typDefinition: t): Doc.t {
  switch (typDefinition.type) {
    case "Enum":
      return Doc.group(
        Doc.concat([
          Doc.group(
            Doc.concat([
              "Inductive",
              Doc.line,
              name,
              Doc.line,
              ":",
              Doc.line,
              "Type",
              Doc.line,
              ":=",
            ]),
          ),
          ...typDefinition.names.map(name =>
            Doc.group(Doc.concat([Doc.hardline, "|", Doc.line, name])),
          ),
          ".",
        ]),
      );
    case "Synonym":
      return Doc.group(
        Doc.concat([
          Doc.group(
            Doc.concat([
              "Definition",
              Doc.line,
              name,
              Doc.line,
              ":",
              Doc.line,
              "Type",
              Doc.line,
              ":=",
            ]),
          ),
          Doc.indent(Doc.concat([Doc.line, Typ.print(typDefinition.typ), "."])),
        ]),
      );
    default:
      return typDefinition;
  }
}
