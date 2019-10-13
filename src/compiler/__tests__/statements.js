// @flow
import {compileAndPrint} from "../index.js";

describe("empty statements", () => {
  it("handles empty statements", () => {
    expect(compileAndPrint(`function foo() {}`)).toMatchInlineSnapshot(`
      "Definition foo :=
        tt."
    `);
  });
});

describe("returns", () => {
  it("handles returns", () => {
    expect(compileAndPrint(`function foo() {return 12;}`))
      .toMatchInlineSnapshot(`
      "Definition foo :=
        12."
    `);
  });

  it("handles empty returns", () => {
    expect(compileAndPrint(`function foo() {return;}`)).toMatchInlineSnapshot(`
      "Definition foo :=
        tt."
    `);
  });
});

describe("destructuring of enums", () => {
  it("handles destructuring of enums", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch ((s: Status)) {
    case "OK":
      return true;
    case "Error":
      return false;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | Status.OK => true
        | Status.Error => false
        end."
    `);
  });

  it("does not handle default cases", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch ((s: Status)) {
    default:
      return true;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "  2 | function foo() {
        3 |   switch ((s: Status)) {
      > 4 |     default:
          |    ^^^^^^^^
      > 5 |       return true;
          | ^^^^^^^^^^^^^^^^^^
        6 |   }
        7 | }
        8 | 

      Unhandled default case"
    `);
  });

  it("expects a type annotation on the discriminant", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s) {
    case "OK":
      return true;
    case "Error":
      return false;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "  1 | 
        2 | function foo() {
      > 3 |   switch (s) {
          |          ^
        4 |     case \\"OK\\":
        5 |       return true;
        6 |     case \\"Error\\":

      Missing type annotation"
    `);
  });
});

describe("definition of variables", () => {
  it("handles definitions of variables", () => {
    expect(compileAndPrint(`function foo() {const x = 12;}`))
      .toMatchInlineSnapshot(`
      "Definition foo :=
        let x := 12 in
        tt."
    `);
  });

  it("does not handle simultaneous definitions", () => {
    expect(compileAndPrint(`function foo() {const x = 12, b = false;}`))
      .toMatchInlineSnapshot(`
      "> 1 | function foo() {const x = 12, b = false;}
          |                ^^^^^^^^^^^^^^^^^^^^^^^^

      Expected exactly one definition"
    `);
  });

  it("does not handle empty definitions", () => {
    expect(compileAndPrint(`function foo() {var x;}`)).toMatchInlineSnapshot(`
      "> 1 | function foo() {var x;}
          |                    ^

      Expected definition"
    `);
  });
});

describe("destructuring of records by definition of variables", () => {
  it("handles destructuring of records", () => {
    expect(compileAndPrint(`function foo() {const {a, b}: Rec = o;}`))
      .toMatchInlineSnapshot(`
      "Definition foo :=
        let '{| Rec.a := a; Rec.b := b; |} := o in
        tt."
    `);
  });

  it("requires a type annotation", () => {
    expect(compileAndPrint(`function foo() {const {a, b} = o;}`))
      .toMatchInlineSnapshot(`
      "> 1 | function foo() {const {a, b} = o;}
          |                      ^^^^^^

      Expected a type annotation for the destructuring"
    `);
  });

  it("requires strings for the field names", () => {
    expect(compileAndPrint(`function foo() {const {["a" + "b"]: v}: Rec = o;}`))
      .toMatchInlineSnapshot(`
      "> 1 | function foo() {const {[\\"a\\" + \\"b\\"]: v}: Rec = o;}
          |                       ^^^^^^^^^^^^^^

      Expected a plain string as identifier"
    `);
  });

  it("requires identifiers for the field values", () => {
    expect(compileAndPrint(`function foo() {const {a: {v}}: Rec = o;}`))
      .toMatchInlineSnapshot(`
      "> 1 | function foo() {const {a: {v}}: Rec = o;}
          |                          ^^^

      Expected an identifier"
    `);
  });

  it("does not recognize spread patterns", () => {
    expect(compileAndPrint(`function foo() {const {...a}: Rec = o;}`))
      .toMatchInlineSnapshot(`
      "> 1 | function foo() {const {...a}: Rec = o;}
          |                       ^^^^

      Unhandled pattern field"
    `);
  });
});
