// @flow
import {compileAndPrint} from "../index.js";

describe("any type", () => {
  it("does not handle the any type", () => {
    expect(compileAndPrint(`const a: any = 12;`)).toMatchInlineSnapshot(`
      "> 1 | const a: any = 12;
          |         ^^^

      The type \`any\` is not handled"
    `);
  });
});

describe("array types", () => {
  it("handles array types", () => {
    expect(compileAndPrint(`const a: number[] = [12];`)).toMatchInlineSnapshot(`
      "Definition a : list Z :=
        [ 12 ]."
    `);
  });
});

describe("existential types", () => {
  it("handles existential types", () => {
    expect(compileAndPrint(`const a: * = 12;`)).toMatchInlineSnapshot(`
      "Definition a : _ :=
        12."
    `);
  });
});

describe("function types", () => {
  it("handles function types", () => {
    expect(
      compileAndPrint(`type Print = (message: string) => void;`),
    ).toMatchInlineSnapshot(`"Definition Print : Type := string -> unit."`);
  });

  it("handles function types with type parameters", () => {
    expect(compileAndPrint(`type Id = <A>(x: A) => A;`)).toMatchInlineSnapshot(
      `"Definition Id : Type := forall {A : Type}, A -> A."`,
    );
  });
});

describe("qualified type annotations", () => {
  it("handles qualified type annotations", () => {
    expect(compileAndPrint(`const a: Foo.t = 12;`)).toMatchInlineSnapshot(`
      "Definition a : Foo.t :=
        12."
    `);
  });
});

describe("interface types", () => {
  it("does not handle interface types", () => {
    expect(compileAndPrint(`const a: interface {} = {};`))
      .toMatchInlineSnapshot(`
      "> 1 | const a: interface {} = {};
          |         ^^^^^^^^^^^^

      Interface types are not handled"
    `);
  });
});

describe("intersection types", () => {
  it("does not handle intersection types", () => {
    expect(compileAndPrint(`const a: string & string = "hi";`))
      .toMatchInlineSnapshot(`
      "> 1 | const a: string & string = \\"hi\\";
          |         ^^^^^^^^^^^^^^^

      Intersection types are not handled"
    `);
  });
});

describe("mixed type", () => {
  it("does not handle the mixed type", () => {
    expect(compileAndPrint(`const a: mixed = "hi";`)).toMatchInlineSnapshot(`
      "> 1 | const a: mixed = \\"hi\\";
          |         ^^^^^

      The type \`mixed\` is not handled"
    `);
  });
});

describe("nullable types", () => {
  it("handles nullable types", () => {
    expect(compileAndPrint(`type t = ?string;`)).toMatchInlineSnapshot(
      `"Definition t : Type := option string."`,
    );
  });
});

describe("object types", () => {
  it("does not handle object types outside of definitions", () => {
    expect(compileAndPrint(`const o: {a: string} = f(x);`))
      .toMatchInlineSnapshot(`
      "> 1 | const o: {a: string} = f(x);
          |         ^^^^^^^^^^^

      This kind of object type is not handled outside of type definitions"
    `);
  });
});

describe("string literal types", () => {
  it("does not handle string literal types outside of definitions", () => {
    expect(compileAndPrint(`const o: "hi" = "hi";`)).toMatchInlineSnapshot(`
      "> 1 | const o: \\"hi\\" = \\"hi\\";
          |         ^^^^

      String literal types are not handled outside of type definitions"
    `);
  });
});

describe("this type", () => {
  it("does not handle the this type", () => {
    expect(compileAndPrint(`type t = this;`)).toMatchInlineSnapshot(`
      "> 1 | type t = this;
          |         ^^^^

      The type \`this\` is not handled"
    `);
  });
});

describe("tuple types", () => {
  it("handles tuple types", () => {
    expect(compileAndPrint(`type t = [string, number];`)).toMatchInlineSnapshot(
      `"Definition t : Type := string * Z."`,
    );
  });

  it("handles empty tuple types", () => {
    expect(compileAndPrint(`type t = [];`)).toMatchInlineSnapshot(
      `"Definition t : Type := unit."`,
    );
  });

  it("does not handle tuple types with a single element", () => {
    expect(compileAndPrint(`type t = [number];`)).toMatchInlineSnapshot(`
      "> 1 | type t = [number];
          |         ^^^^^^^^

      Tuple types with exactly one element are not handled"
    `);
  });
});

describe("typeof operator", () => {
  it("does not handle the typeof operator", () => {
    expect(compileAndPrint(`type t = typeof 12;`)).toMatchInlineSnapshot(`
      "> 1 | type t = typeof 12;
          |         ^^^^^^^^^

      Extracting the type of values with \`typeof\` is not handled"
    `);
  });
});

describe("unhandled types", () => {
  it("shows an error message on unhandled types", () => {
    expect(compileAndPrint(`const a: number | string = 12;`))
      .toMatchInlineSnapshot(`
      "> 1 | const a: number | string = 12;
          |         ^^^^^^^^^^^^^^^

      Union types are not handled outside of type definitions"
    `);
  });
});
