// @flow
import * as BabelAst from "./babel-ast.js";
import * as Doc from "./doc.js";
import * as Identifier from "./identifier.js";
import * as Monad from "./monad.js";
import * as Util from "./util.js";

export type t =
  | {
      type: "Function",
      params: t[],
      returnTyp: t,
      typParams: string[],
    }
  | {
      type: "Implicit",
    }
  | {
      type: "Tuple",
      params: t[],
    }
  | {
      type: "Variable",
      name: string,
      params: t[],
    };

export function* getObjectKeyName(key: any): Monad.t<string> {
  switch (key.type) {
    case "Identifier":
      return Identifier.compile(key);
    case "StringLiteral":
      return key.value;
    default:
      return yield* Monad.raise<string>(key, "Computed key name not handled");
  }
}

function compileIdentifierOrQualifiedTypeIdentifier(
  id: BabelAst.Identifier | BabelAst.QualifiedTypeIdentifier,
): string {
  switch (id.type) {
    case "Identifier":
      return Identifier.compile(id);
    case "QualifiedTypeIdentifier":
      return `${compileIdentifierOrQualifiedTypeIdentifier(
        id.qualification,
      )}.${Identifier.compile(id.id)}`;
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

type PlainTypOrRest =
  | {
      type: "PlainTyp",
      typ: t,
    }
  | {
      type: "Rest",
      typ:
        | BabelAst.ObjectTypeAnnotation
        | BabelAst.StringLiteralTypeAnnotation
        | BabelAst.UnionTypeAnnotation,
    };

export function* compileIfPlainTyp(
  typ: BabelAst.FlowType,
): Monad.t<PlainTypOrRest> {
  switch (typ.type) {
    case "AnyTypeAnnotation":
      return yield* Monad.raise<PlainTypOrRest>(
        typ,
        "The type `any` is not handled",
      );
    case "ArrayTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: "list",
          params: [yield* compile(typ.elementType)],
        },
      };
    case "BooleanLiteralTypeAnnotation":
      return yield* Monad.raise<PlainTypOrRest>(
        typ,
        "Boolean literals in types are not handled",
      );
    case "BooleanTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: "bool",
          params: [],
        },
      };
    case "EmptyTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: "Empty_set",
          params: [],
        },
      };
    case "ExistsTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Implicit",
        },
      };
    case "FunctionTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Function",
          params: yield* Monad.all(
            typ.params.map(({typeAnnotation}) => compile(typeAnnotation)),
          ),
          returnTyp: yield* compile(typ.returnType),
          typParams: typ.typeParameters
            ? Util.filterMap(typ.typeParameters.params, param => param.name)
            : [],
        },
      };
    case "GenericTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: compileIdentifierOrQualifiedTypeIdentifier(typ.id),
          params: [],
        },
      };
    case "InterfaceTypeAnnotation":
      return yield* Monad.raise<PlainTypOrRest>(
        typ,
        "Interface types are not handled",
      );
    case "IntersectionTypeAnnotation":
      return yield* Monad.raise<PlainTypOrRest>(
        typ,
        "Intersection types are not handled",
      );
    case "MixedTypeAnnotation":
      return yield* Monad.raise<PlainTypOrRest>(
        typ,
        "The type `mixed` is not handled",
      );
    case "NullableTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: "option",
          params: [yield* compile(typ.typeAnnotation)],
        },
      };
    case "NullLiteralTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: "unit",
          params: [],
        },
      };
    case "NumberLiteralTypeAnnotation":
      return yield* Monad.raise<PlainTypOrRest>(
        typ,
        "Number literals in types are not handled",
      );
    case "NumberTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: "Z",
          params: [],
        },
      };
    case "ObjectTypeAnnotation": {
      if (typ.properties.length === 0) {
        return {
          type: "PlainTyp",
          typ: {
            type: "Variable",
            name: "unit",
            params: [],
          },
        };
      }

      return {
        type: "Rest",
        typ,
      };
    }
    case "StringLiteralTypeAnnotation":
      return {
        type: "Rest",
        typ,
      };
    case "StringTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: "string",
          params: [],
        },
      };
    case "ThisTypeAnnotation":
      return yield* Monad.raise<PlainTypOrRest>(
        typ,
        "The type `this` is not handled",
      );
    case "TupleTypeAnnotation":
      if (typ.types.length === 1) {
        return yield* Monad.raise<PlainTypOrRest>(
          typ,
          "Tuple types with exactly one element are not handled",
        );
      }

      return {
        type: "PlainTyp",
        typ: {
          type: "Tuple",
          params: yield* Monad.all(typ.types.map(typ => compile(typ))),
        },
      };
    case "TypeofTypeAnnotation":
      return yield* Monad.raise<PlainTypOrRest>(
        typ,
        "Extracting the type of values with `typeof` is not handled",
      );
    case "UnionTypeAnnotation":
      return {
        type: "Rest",
        typ,
      };
    case "VoidTypeAnnotation":
      return {
        type: "PlainTyp",
        typ: {
          type: "Variable",
          name: "unit",
          params: [],
        },
      };
    /* istanbul ignore next */
    default:
      return typ;
  }
}

export function* compile(typ: BabelAst.FlowType): Monad.t<t> {
  const compiledTyp = yield* compileIfPlainTyp(typ);

  switch (compiledTyp.type) {
    case "PlainTyp":
      return compiledTyp.typ;
    case "Rest":
      switch (compiledTyp.typ.type) {
        case "ObjectTypeAnnotation":
          return yield* Monad.raise<t>(
            compiledTyp.typ,
            "This kind of object type is not handled outside of type definitions",
          );
        case "StringLiteralTypeAnnotation":
          return yield* Monad.raise<t>(
            compiledTyp.typ,
            "String literal types are not handled outside of type definitions",
          );
        case "UnionTypeAnnotation":
          return yield* Monad.raise<t>(
            compiledTyp.typ,
            "Union types are not handled outside of type definitions",
          );
        /* istanbul ignore next */
        default:
          return compiledTyp.typ;
      }
    /* istanbul ignore next */
    default:
      return compiledTyp;
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
        ]),
      ),
      Doc.softline,
      "}",
    ]),
  );
}

export function print(needParens: boolean, typ: t): Doc.t {
  switch (typ.type) {
    case "Function":
      return Doc.paren(
        needParens,
        Doc.group(
          Doc.concat([
            ...(typ.typParams.length !== 0
              ? [
                  Doc.group(
                    Doc.concat([
                      "forall",
                      Doc.line,
                      "{",
                      Doc.indent(
                        Doc.group(
                          Doc.concat([
                            Doc.softline,
                            ...typ.typParams.map(typParam =>
                              Doc.concat([typParam, Doc.line]),
                            ),
                            Doc.group(Doc.concat([":", Doc.line, "Type"])),
                          ]),
                        ),
                      ),
                      Doc.softline,
                      "}",
                      ",",
                      Doc.line,
                    ]),
                  ),
                ]
              : []),
            ...typ.params.map(param =>
              Doc.group(
                Doc.concat([print(true, param), Doc.line, "->", Doc.line]),
              ),
            ),
            print(true, typ.returnTyp),
          ]),
        ),
      );
    case "Implicit":
      return "_";
    case "Tuple":
      switch (typ.params.length) {
        case 0:
          return "unit";
        default:
          return Doc.paren(
            needParens,
            Doc.group(
              Doc.join(
                Doc.concat([Doc.line, "*", Doc.line]),
                typ.params.map(param => print(true, param)),
              ),
            ),
          );
      }
    case "Variable":
      return Doc.paren(
        needParens && typ.params.length !== 0,
        Doc.group(
          Doc.concat([
            typ.name,
            Doc.indent(
              Doc.concat(
                typ.params.map(param =>
                  Doc.concat([Doc.line, print(true, param)]),
                ),
              ),
            ),
          ]),
        ),
      );
    /* istanbul ignore next */
    default:
      return typ;
  }
}

export function printReturnTyp(typ: ?t, nextToken: Doc.t): Doc.t {
  return Doc.group(
    Doc.concat([
      ...(typ ? [":", Doc.line, print(false, typ), Doc.line] : []),
      nextToken,
    ]),
  );
}
