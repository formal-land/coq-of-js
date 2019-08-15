// @flow

export type t = {
  type: "Variable",
  name: string,
};

export function compile(typ: any): t {
  switch (typ.type) {
    case "GenericTypeAnnotation":
      return {
        type: "Variable",
        name: typ.id.name,
      };
    case "NumberTypeAnnotation":
      return {
        type: "Variable",
        name: "Z",
      };
    default:
      throw new Error(JSON.stringify(typ, null, 2));
  }
}
