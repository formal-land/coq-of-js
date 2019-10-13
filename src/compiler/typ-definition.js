// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Identifier from "./identifier.js";
import * as Monad from "./monad.js";
import * as Typ from "./typ.js";
import * as Util from "./util.js";

type Constructor = {name: string, fields: {name: string, typ: Typ.t}[]};

export type t =
  | {
      type: "Enum",
      names: string[],
    }
  | {
      type: "Record",
      fields: {name: string, typ: Typ.t}[],
    }
  | {
      type: "Sum",
      constructors: Constructor[],
    }
  | {
      type: "Synonym",
      typ: Typ.t,
    };

export function getObjectTypePropertyName(
  property: BabelAst.ObjectTypeProperty,
): string {
  switch (property.key.type) {
    case "Identifier":
      return Identifier.compile(property.key);
    case "StringLiteral":
      return property.key.value;
    /* istanbul ignore next */
    default:
      return property.key;
  }
}

function* getStringOfStringLiteralTypeAnnotation(
  typ: BabelAst.FlowType,
): Monad.t<string> {
  switch (typ.type) {
    case "StringLiteralTypeAnnotation":
      return typ.value;
    default:
      return yield* Monad.raise<string>(typ, "Expected a string literal");
  }
}

function* compileStringEnum(typs: BabelAst.FlowType[]): Monad.t<t> {
  const names = yield* Monad.all(
    typs.map(function*(typ) {
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

function* compileSumType(typs: BabelAst.FlowType[]): Monad.t<t> {
  const constructors = yield* Monad.all(
    typs.map(function*(typ) {
      switch (typ.type) {
        case "ObjectTypeAnnotation": {
          const [nameProperties, fieldProperties] = yield* Monad.reduce(
            typ.properties,
            [[], []],
            function*([nameProperties, fieldProperties], property) {
              if (property.type !== "ObjectTypeProperty") {
                return yield* Monad.raise<[*, *]>(
                  property,
                  "Expected a named property",
                );
              }

              const name = getObjectTypePropertyName(property);

              return name === "type"
                ? [[...nameProperties, property], fieldProperties]
                : [nameProperties, [...fieldProperties, property]];
            },
          );

          if (nameProperties.length === 0) {
            return yield* Monad.raise<Constructor>(
              typ,
              "Expected at least one field with the name `type`",
            );
          }

          return {
            name: yield* getStringOfStringLiteralTypeAnnotation(
              nameProperties[0].value,
            ),
            fields: yield* Monad.all(
              fieldProperties.map(function*(
                property: BabelAst.ObjectTypeProperty,
              ) {
                return {
                  name: getObjectTypePropertyName(property),
                  typ: yield* Typ.compile(property.value),
                };
              }),
            ),
          };
        }
        default:
          return yield* Monad.raise<Constructor>(
            typ,
            "Only objects are handled in sum types",
          );
      }
    }),
  );

  return {
    type: "Sum",
    constructors,
  };
}

export function* compile(typ: BabelAst.FlowType): Monad.t<t> {
  const plainTyp = yield* Typ.compileIfHandled(typ);

  if (plainTyp) {
    return {
      type: "Synonym",
      typ: plainTyp,
    };
  }

  switch (typ.type) {
    case "ObjectTypeAnnotation": {
      const withATypeField = typ.properties.some(
        property =>
          property.type === "ObjectTypeProperty" &&
          getObjectTypePropertyName(property) === "type",
      );

      if (withATypeField) {
        return yield* compileSumType([typ]);
      }

      const fields = yield* Monad.all(
        typ.properties.map(function*(property) {
          if (property.type !== "ObjectTypeProperty") {
            return yield* Monad.raise(property, "Expected named property");
          }

          return {
            name: getObjectTypePropertyName(property),
            typ: yield* Typ.compile(property.value),
          };
        }),
      );

      return {
        type: "Record",
        fields,
      };
    }
    case "StringLiteralTypeAnnotation":
      return yield* compileStringEnum([typ]);
    case "UnionTypeAnnotation": {
      if (typ.types.length === 0) {
        return {
          type: "Synonym",
          typ: {
            type: "Variable",
            name: "Empty_set",
          },
        };
      }

      switch (typ.types[0].type) {
        case "ObjectTypeAnnotation":
          return yield* compileSumType(typ.types);
        case "StringLiteralTypeAnnotation":
          return yield* compileStringEnum(typ.types);
        default:
          return yield* Monad.raise<t>(
            typ,
            "Only handle unions of strings or objects with a `type` field",
          );
      }
    }
    default:
      return yield* Monad.raiseUnhandled<t>(typ);
  }
}

function printModule(name: string, doc: Doc.t): Doc.t {
  return Doc.group(
    Doc.concat([
      Doc.group(Doc.concat(["Module", Doc.line, name, "."])),
      Doc.indent(Doc.concat([Doc.hardline, doc])),
      Doc.group(Doc.concat([Doc.hardline, "End", Doc.line, name, "."])),
    ]),
  );
}

function printRecord(
  name: string,
  fields: {name: string, typ: Typ.t}[],
): Doc.t {
  return Doc.concat([
    Doc.group(
      Doc.concat(["Record", Doc.line, "t", Doc.line, ":=", Doc.line, "{"]),
    ),
    Doc.indent(
      Doc.concat(
        fields.map(({name, typ}) =>
          Doc.concat([
            Doc.hardline,
            name,
            Doc.line,
            ":",
            Doc.line,
            Typ.print(typ),
            Doc.softline,
            ";",
          ]),
        ),
      ),
    ),
    Doc.hardline,
    "}.",
  ]);
}

function printDefineTypeAsModule(name: string): Doc.t {
  return Doc.group(
    Doc.concat([
      "Definition",
      Doc.line,
      name,
      Doc.line,
      ":=",
      Doc.line,
      `${name}.t`,
      ".",
    ]),
  );
}

export function print(name: string, typDefinition: t): Doc.t {
  switch (typDefinition.type) {
    case "Enum": {
      const module = printModule(
        name,
        Doc.concat([
          Doc.group(Doc.concat(["Inductive", Doc.line, "t", Doc.line, ":="])),
          ...typDefinition.names.map(name =>
            Doc.group(Doc.concat([Doc.hardline, "|", Doc.line, name])),
          ),
          ".",
        ]),
      );

      return Doc.concat([module, Doc.hardline, printDefineTypeAsModule(name)]);
    }
    case "Record":
      return Doc.concat([
        printModule(name, printRecord("t", typDefinition.fields)),
        Doc.hardline,
        printDefineTypeAsModule(name),
      ]);
    case "Sum": {
      const module = printModule(
        name,
        Doc.concat([
          Doc.join(Doc.concat([Doc.hardline, Doc.hardline]), [
            ...Util.filterMap(typDefinition.constructors, constructor =>
              constructor.fields.length !== 0
                ? printModule(
                    constructor.name,
                    printRecord("t", constructor.fields),
                  )
                : null,
            ),
            Doc.group(
              Doc.concat([
                Doc.group(
                  Doc.concat(["Inductive", Doc.line, "t", Doc.line, ":="]),
                ),
                ...typDefinition.constructors.map(({name, fields}) =>
                  Doc.group(
                    Doc.concat([
                      Doc.hardline,
                      "|",
                      Doc.line,
                      name,
                      ...(fields.length !== 0
                        ? [
                            Doc.line,
                            "(",
                            Doc.softline,
                            "_",
                            Doc.line,
                            ":",
                            Doc.line,
                            name,
                            ".t",
                            Doc.softline,
                            ")",
                          ]
                        : []),
                    ]),
                  ),
                ),
                ".",
              ]),
            ),
          ]),
        ]),
      );

      return Doc.concat([module, Doc.hardline, printDefineTypeAsModule(name)]);
    }
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
    /* istanbul ignore next */
    default:
      return typDefinition;
  }
}
