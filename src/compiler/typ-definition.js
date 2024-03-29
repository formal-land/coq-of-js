// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Expression from "./expression.js";
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

function* getObjectTypePropertyName(
  property: BabelAst.ObjectTypeProperty,
): Monad.t<string> {
  return yield* Typ.getObjectKeyName(property.key);
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

              const name = yield* getObjectTypePropertyName(property);

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
                  name: yield* getObjectTypePropertyName(property),
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
  const compiledTyp = yield* Typ.compileIfPlainTyp(typ);

  switch (compiledTyp.type) {
    case "PlainTyp":
      return {
        type: "Synonym",
        typ: compiledTyp.typ,
      };
    case "Rest":
      switch (compiledTyp.typ.type) {
        case "ObjectTypeAnnotation": {
          const objectTyp = compiledTyp.typ;
          const withATypeField = yield* Monad.some(
            objectTyp.properties,
            function*(property) {
              switch (property.type) {
                case "ObjectTypeProperty":
                  return (
                    (yield* getObjectTypePropertyName(property)) === "type"
                  );
                default:
                  return false;
              }
            },
          );

          if (withATypeField) {
            return yield* compileSumType([objectTyp]);
          }

          const fields = yield* Monad.all(
            objectTyp.properties.map(function*(property) {
              if (property.type !== "ObjectTypeProperty") {
                return yield* Monad.raise(property, "Expected named property");
              }

              return {
                name: yield* getObjectTypePropertyName(property),
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
          return yield* compileStringEnum([compiledTyp.typ]);
        case "UnionTypeAnnotation": {
          /* istanbul ignore next */
          if (compiledTyp.typ.types.length === 0) {
            return {
              type: "Synonym",
              typ: {
                type: "Variable",
                name: "Empty_set",
                params: [],
              },
            };
          }

          switch (compiledTyp.typ.types[0].type) {
            case "ObjectTypeAnnotation":
              return yield* compileSumType(compiledTyp.typ.types);
            case "StringLiteralTypeAnnotation":
              return yield* compileStringEnum(compiledTyp.typ.types);
            default:
              return yield* Monad.raise<t>(
                compiledTyp.typ,
                "Only handle unions of strings or objects with a `type` field",
              );
          }
        }
        /* istanbul ignore next */
        default:
          return compiledTyp.typ;
      }
    /* istanbul ignore next */
    default:
      return compiledTyp;
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
  withSetters: boolean,
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
            Typ.print(false, typ),
            Doc.softline,
            ";",
          ]),
        ),
      ),
    ),
    Doc.hardline,
    "}.",
    ...(withSetters
      ? [
          Doc.hardline,
          Doc.join(
            Doc.hardline,
            fields.map(({name, typ}) =>
              Doc.group(
                Doc.concat([
                  Doc.group(
                    Doc.concat(["Definition", Doc.line, `set_${name}`]),
                  ),
                  Doc.indent(
                    Doc.group(
                      Doc.concat([
                        Doc.line,
                        "r",
                        Doc.line,
                        name,
                        Doc.line,
                        ":=",
                      ]),
                    ),
                  ),
                  Doc.indent(
                    Doc.concat([
                      Doc.line,
                      Expression.printRecordInstance(
                        null,
                        fields.map(field => ({
                          name: field.name,
                          value:
                            field.name === name ? name : `r.(${field.name})`,
                        })),
                      ),
                      ".",
                    ]),
                  ),
                ]),
              ),
            ),
          ),
        ]
      : []),
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
        printModule(name, printRecord("t", typDefinition.fields, true)),
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
                    printRecord("t", constructor.fields, false),
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
                      Doc.line,
                      "(",
                      Doc.softline,
                      "_",
                      Doc.line,
                      ":",
                      Doc.line,
                      ...(fields.length !== 0 ? [name, ".t"] : ["unit"]),
                      Doc.softline,
                      ")",
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
          Doc.indent(
            Doc.concat([Doc.line, Typ.print(false, typDefinition.typ), "."]),
          ),
        ]),
      );
    /* istanbul ignore next */
    default:
      return typDefinition;
  }
}
