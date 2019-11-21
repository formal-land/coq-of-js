// @flow
import {compileAndPrint} from "../index.js";

describe("arrays", () => {
  it("handles arrays", () => {
    expect(compileAndPrint(`const a = [12];`)).toMatchInlineSnapshot(`
      "Definition a :=
        [ 12 ]."
    `);
  });

  it("handles empty arrays", () => {
    expect(compileAndPrint(`const a = [];`)).toMatchInlineSnapshot(`
      "Definition a :=
        []."
    `);
  });

  it("does not handle empty elements", () => {
    expect(compileAndPrint(`const a = [,];`)).toMatchInlineSnapshot(`
      "> 1 | const a = [,];
          |          ^^^

      Expected non-empty elements in the array"
    `);
  });

  it("does not handle spreads", () => {
    expect(compileAndPrint(`const a = [...[]];`)).toMatchInlineSnapshot(`
      "> 1 | const a = [...[]];
          |           ^^^^^

      Spreads in arrays are not handled"
    `);
  });
});

describe("arrow functions", () => {
  it("handles arrow functions", () => {
    expect(compileAndPrint(`const f = x => x;`)).toMatchInlineSnapshot(`
      "Definition f :=
        fun x => x."
    `);
  });

  it("handles type annotations", () => {
    expect(compileAndPrint(`const f = <A>(x: A): A => x;`))
      .toMatchInlineSnapshot(`
      "Definition f :=
        fun {A : Type} (x : A) => x."
    `);
  });

  it("requires function parameters to be simple names", () => {
    expect(compileAndPrint(`const f = ({a}) => {};`)).toMatchInlineSnapshot(`
      "> 1 | const f = ({a}) => {};
          |           ^^^

      Expected simple identifier as function parameter"
    `);
  });
});

describe("binary expressions", () => {
  it("handles binary expressions", () => {
    expect(compileAndPrint(`const n = 1 + 1;`)).toMatchInlineSnapshot(`
      "Definition n :=
        1 + 1."
    `);
  });

  it("handles nested binary expressions", () => {
    expect(compileAndPrint(`const n = (1 + 2) * 3;`)).toMatchInlineSnapshot(`
      "Definition n :=
        (1 + 2) * 3."
    `);
  });
});

describe("function calls", () => {
  it("handles function calls", () => {
    expect(compileAndPrint(`const y = f(x);`)).toMatchInlineSnapshot(`
      "Definition y :=
        f x."
    `);
  });

  it("does not handle partial application", () => {
    expect(compileAndPrint(`const n = f(?, a);`)).toMatchInlineSnapshot(`
      "> 1 | const n = f(?, a);
          |            ^

      Unhandled partial application"
    `);
  });

  it("does not handle spread parameters", () => {
    expect(compileAndPrint(`const n = f(...a);`)).toMatchInlineSnapshot(`
      "> 1 | const n = f(...a);
          |            ^^^^

      Unhandled spread parameters"
    `);
  });
});

describe("ternary expressions", () => {
  it("handles ternary expressions", () => {
    expect(compileAndPrint(`const n = true ? 12 : 0;`)).toMatchInlineSnapshot(`
      "Definition n :=
        if true then 12 else 0."
    `);
  });
});

describe("functions", () => {
  it("handles functions in expressions", () => {
    expect(compileAndPrint(`const f = function (x) {return x};`))
      .toMatchInlineSnapshot(`
      "Definition f :=
        fun x => x."
    `);
  });
});

describe("logical expressions", () => {
  it("handles logical expressions", () => {
    expect(compileAndPrint(`const b = true && false;`)).toMatchInlineSnapshot(`
      "Definition b :=
        true && false."
    `);
  });
});

describe("member accesses", () => {
  it("handles member accesses from records", () => {
    expect(compileAndPrint(`const a = (o: Rec).a;`)).toMatchInlineSnapshot(`
      "Definition a :=
        o.(Rec.a)."
    `);
  });

  it("requires a type annotation to know the record type", () => {
    expect(compileAndPrint(`const a = o.a;`)).toMatchInlineSnapshot(`
      "> 1 | const a = o.a;
          |          ^

      Expected a type annotation on this object to access a member"
    `);
  });
});

describe("new expressions", () => {
  it("does not hande new expressions", () => {
    expect(compileAndPrint(`const x = new Foo();`)).toMatchInlineSnapshot(`
      "> 1 | const x = new Foo();
          |          ^^^^^^^^^

      Unhandled syntax:
      {
        \\"type\\": \\"NewExpression\\",
        \\"start\\": 10,
        \\"end\\": 19,
        \\"loc\\": {
          \\"start\\": {
            \\"line\\": 1,
            \\"column\\": 10
          },
          \\"end\\": {
            \\"line\\": 1,
            \\"column\\": 19
          }
        },
        \\"callee\\": {
          \\"type\\": \\"Identifier\\",
          \\"start\\": 14,
          \\"end\\": 17,
          \\"loc\\": {
            \\"start\\": {
              \\"line\\": 1,
              \\"column\\": 14
            },
            \\"end\\": {
              \\"line\\": 1,
              \\"column\\": 17
            },
            \\"identifierName\\": \\"Foo\\"
          },
          \\"name\\": \\"Foo\\"
        },
        \\"typeArguments\\": null,
        \\"arguments\\": []
      }"
    `);
  });
});

describe("nulls", () => {
  it("handles nulls", () => {
    expect(compileAndPrint(`const n = null;`)).toMatchInlineSnapshot(`
      "Definition n :=
        tt."
    `);
  });
});

describe("objects as records", () => {
  it("handles empty objects", () => {
    expect(compileAndPrint(`const o = {};`)).toMatchInlineSnapshot(`
      "Definition o :=
        tt."
    `);
  });

  it("does not handle non-empty objects without annotations", () => {
    expect(compileAndPrint(`const o = {x: 12};`)).toMatchInlineSnapshot(`
      "> 1 | const o = {x: 12};
          |          ^^^^^^^

      Unhandled object expression without type annotation"
    `);
  });

  it("handles record instances", () => {
    expect(compileAndPrint(`const o = ({a: "hi", "b": 12}: Rec);`))
      .toMatchInlineSnapshot(`
      "Definition o :=
        {| Rec.a := \\"hi\\"; Rec.b := 12; |}."
    `);
  });

  it("does not handle records with methods", () => {
    expect(compileAndPrint(`const o = ({foo() {}}: Rec);`))
      .toMatchInlineSnapshot(`
      "> 1 | const o = ({foo() {}}: Rec);
          |            ^^^^^^^^

      Expected a named property"
    `);
  });

  it("does not handle records with spreads", () => {
    expect(compileAndPrint(`const o = ({...rec}: Rec);`))
      .toMatchInlineSnapshot(`
      "> 1 | const o = ({...rec}: Rec);
          |            ^^^^^^

      Expected a named property"
    `);
  });

  it("does not handle records with computed property names", () => {
    expect(compileAndPrint(`const o = ({[a]: "hi"}: Rec);`))
      .toMatchInlineSnapshot(`
      "> 1 | const o = ({[a]: \\"hi\\"}: Rec);
          |             ^

      Unhandled computed property name"
    `);
  });

  it("does not handle records with numeric names", () => {
    expect(compileAndPrint(`const o = ({12: "hi"}: Rec);`))
      .toMatchInlineSnapshot(`
      "> 1 | const o = ({12: \\"hi\\"}: Rec);
          |            ^^

      Computed key name not handled"
    `);
  });
});

describe("objects as sum types", () => {
  it("handles sum types", () => {
    expect(compileAndPrint(`const o = ({type: "Foo", a: 12}: Status);`))
      .toMatchInlineSnapshot(`
      "Definition o :=
        Status.Foo {| Status.Foo.a := 12; |}."
    `);
  });

  it("handles sum types without parameters", () => {
    expect(compileAndPrint(`const o = ({type: "Foo"}: Status);`))
      .toMatchInlineSnapshot(`
      "Definition o :=
        Status.Foo tt."
    `);
  });

  it("expects the `type` field to be a literal strings", () => {
    expect(compileAndPrint(`const o = ({type: 12}: Status);`))
      .toMatchInlineSnapshot(`
      "> 1 | const o = ({type: 12}: Status);
          |                  ^^

      Expected a string literal"
    `);
  });
});

describe("enums", () => {
  it("handles enums", () => {
    expect(compileAndPrint(`const e = ("Green": Kind);`))
      .toMatchInlineSnapshot(`
      "Definition e :=
        Kind.Green."
    `);
  });

  it("does not handle enums with an inlined type annotation", () => {
    expect(compileAndPrint(`const e = ("Green": "Green" | "Blue");`))
      .toMatchInlineSnapshot(`
      "> 1 | const e = (\\"Green\\": \\"Green\\" | \\"Blue\\");
          |                    ^^^^^^^^^^^^^^^^

      Expected a type identifier"
    `);
  });
});

describe("type casts", () => {
  it("handles type casts", () => {
    expect(compileAndPrint(`const b = (true: boolean);`))
      .toMatchInlineSnapshot(`
      "Definition b :=
        (true : bool)."
    `);
  });
});

describe("unary expressions", () => {
  it("handles unary expressions", () => {
    expect(compileAndPrint(`const n = +0;`)).toMatchInlineSnapshot(`
      "Definition n :=
        + 0."
    `);
  });
});
