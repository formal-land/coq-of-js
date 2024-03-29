// @flow
import {compileAndPrint} from "../index.js";

describe("header", () => {
  it("can include header", () => {
    expect(compileAndPrint(`const x = 12;`, true)).toMatchInlineSnapshot(`
      "(* Generated by coq-of-js *)
      Require Import Coq.Lists.List.
      Require Import Coq.Strings.String.
      Require Import Coq.ZArith.ZArith.

      Import ListNotations.
      Local Open Scope string.
      Local Open Scope Z.

      Definition x :=
        12.
      "
    `);
  });
});

describe("empty statements", () => {
  it("handles empty statements", () => {
    expect(compileAndPrint(`function foo() {}`)).toMatchInlineSnapshot(`
      "Definition foo :=
        tt.
      "
    `);
  });
});

describe("block statements", () => {
  it("handles block statements", () => {
    expect(compileAndPrint(`function foo() {{const x = 12; return x}}`))
      .toMatchInlineSnapshot(`
      "Definition foo :=
        let x := 12 in
        x.
      "
    `);
  });
});

describe("returns", () => {
  it("handles returns", () => {
    expect(compileAndPrint(`function foo() {return 12;}`))
      .toMatchInlineSnapshot(`
      "Definition foo :=
        12.
      "
    `);
  });

  it("handles empty returns", () => {
    expect(compileAndPrint(`function foo() {return;}`)).toMatchInlineSnapshot(`
      "Definition foo :=
        tt.
      "
    `);
  });
});

describe("destructuring of enums", () => {
  it("handles destructuring of enums", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
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
        end.
      "
    `);
  });

  it("handles default cases", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    default:
      return true;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | _ => true
        end.
      "
    `);
  });

  it("handles repeated cases", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    case "OK":
    case "Error":
      return true;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | Status.OK | Status.Error => true
        end.
      "
    `);
  });

  it("handles trailing cases", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    case "OK":
      return null;
    case "Error":
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | Status.OK => tt
        | Status.Error => tt
        end.
      "
    `);
  });

  it("handles empty default", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    case "OK":
      return 12;
    default:
      return (s: empty);
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | Status.OK => 12
        end.
      "
    `);
  });

  it("handles empty default in a block", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    case "OK":
      return 12;
    default: {
      return (s: empty);
    }
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | Status.OK => 12
        end.
      "
    `);
  });

  it("adds default with non-empty type annotation", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    default:
      return (23: number);
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | _ => (23 : Z)
        end.
      "
    `);
  });

  it("adds default with empty return", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    default:
      return;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | _ => tt
        end.
      "
    `);
  });

  it("adds default which does not start with return", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    default:
      const x = 12;
      return x;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | _ => let x := 12 in
          x
        end.
      "
    `);
  });

  it("adds default without returns", () => {
    expect(
      compileAndPrint(`
function foo() {
  switch (s /* Status */) {
    default:
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo :=
        match s with
        | _ => tt
        end.
      "
    `);
  });

  it("requires the enum type in trailing comment", () => {
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

      Expected a trailing comment with the type name on which we discriminate"
    `);
  });
});

describe("destructuring of sums", () => {
  it("handles destructuring of sums", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK": {
      const {value} = result;
      return value;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo result :=
        match result with
        | Result.OK {| Result.OK.value := value; |} => value
        | _ => tt
        end.
      "
    `);
  });

  it("handles empty cases", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK":
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo result :=
        match result with
        | Result.OK _ => tt
        | _ => tt
        end.
      "
    `);
  });

  it("does not handle multiple variable definitions", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK": {
      const {value} = result, x = 12;
      return value
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "  3 |   switch (result.type /* Result */) {
        4 |     case \\"OK\\": {
      > 5 |       const {value} = result, x = 12;
          |      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        6 |       return value
        7 |     }
        8 |     default:

      Expected a single definition of variable"
    `);
  });

  it("does not handle empty variable definition", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK": {
      var x;
      return x;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "  3 |   switch (result.type /* Result */) {
        4 |     case \\"OK\\": {
      > 5 |       var x;
          |          ^
        6 |       return x;
        7 |     }
        8 |     default:

      Expected a definition with a value"
    `);
  });

  it("does not take into account object destructuring on different variables", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK": {
      const {value}: Rec = otherResult;
      return value;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo result :=
        match result with
        | Result.OK _ => let '{| Rec.value := value; |} := otherResult in
          value
        | _ => tt
        end.
      "
    `);
  });

  it("requires the destructuring to be with an object pattern", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK": {
      const value = result;
      return value;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "  3 |   switch (result.type /* Result */) {
        4 |     case \\"OK\\": {
      > 5 |       const value = result;
          |            ^^^^^
        6 |       return value;
        7 |     }
        8 |     default:

      Expected an object pattern to destructure a sum type"
    `);
  });

  it("does not take into account object destructuring on expressions wich are not variables", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK": {
      const {value}: Rec = f(x);
      return value;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo result :=
        match result with
        | Result.OK _ => let '{| Rec.value := value; |} := f x in
          value
        | _ => tt
        end.
      "
    `);
  });

  it("does not take into account other actions than assignment of variables", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK": {
      return 12;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo result :=
        match result with
        | Result.OK _ => 12
        | _ => tt
        end.
      "
    `);
  });

  it("does not require a default field", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type /* Result */) {
    case "OK":
      return 12;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "Definition foo result :=
        match result with
        | Result.OK _ => 12
        end.
      "
    `);
  });

  it("requires the switch to be on the `type` field", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.kind /* Result */) {
    case "OK": {
      const {value} = result;
      return value;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "  1 | 
        2 | function foo(result) {
      > 3 |   switch (result.kind /* Result */) {
          |                 ^^^^
        4 |     case \\"OK\\": {
        5 |       const {value} = result;
        6 |       return value;

      Expected an access on the \`type\` field to destructure a sum type"
    `);
  });

  it("requires the switch to be on an identifier", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (f(x).type /* Result */) {
    case "OK": {
      const {value} = result;
      return value;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "  1 | 
        2 | function foo(result) {
      > 3 |   switch (f(x).type /* Result */) {
          |          ^^^^
        4 |     case \\"OK\\": {
        5 |       const {value} = result;
        6 |       return value;

      Expected a switch on an identifier to destructure a sum type"
    `);
  });

  it("requires the sum type in trailing comment", () => {
    expect(
      compileAndPrint(`
function foo(result) {
  switch (result.type) {
    case "OK": {
      const {value} = result;
      return value;
    }
    default:
      return null;
  }
}
`),
    ).toMatchInlineSnapshot(`
      "  1 | 
        2 | function foo(result) {
      > 3 |   switch (result.type) {
          |          ^^^^^^^^^^^
        4 |     case \\"OK\\": {
        5 |       const {value} = result;
        6 |       return value;

      Expected a trailing comment with the type name on which we discriminate"
    `);
  });
});

describe("definition of variables", () => {
  it("handles definitions of variables", () => {
    expect(compileAndPrint(`function foo() {const x = 12;}`))
      .toMatchInlineSnapshot(`
      "Definition foo :=
        let x := 12 in
        tt.
      "
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

      Expected a definition with a value"
    `);
  });
});

describe("destructuring of arrays", () => {
  it("does not handle destructuring of arrays", () => {
    expect(
      compileAndPrint(`
function foo() {
  const [a] = [1, 2];
  return a;
}
`),
    ).toMatchInlineSnapshot(`
      "  1 | 
        2 | function foo() {
      > 3 |   const [a] = [1, 2];
          |        ^^^
        4 |   return a;
        5 | }
        6 | 

      Unhandled array patterns"
    `);
  });
});

describe("destructuring of records by definition of variables", () => {
  it("handles destructuring of records", () => {
    expect(compileAndPrint(`function foo() {const {a, b}: Rec = o;}`))
      .toMatchInlineSnapshot(`
      "Definition foo :=
        let '{| Rec.a := a; Rec.b := b; |} := o in
        tt.
      "
    `);
  });

  it("requires a type annotation", () => {
    expect(compileAndPrint(`function foo() {const {a, b} = o;}`))
      .toMatchInlineSnapshot(`
      "> 1 | function foo() {const {a, b} = o;}
          |                      ^^^^^^

      Expected a type annotation for record destructuring"
    `);
  });

  it("requires strings for the field names", () => {
    expect(compileAndPrint(`function foo() {const {["a" + "b"]: v}: Rec = o;}`))
      .toMatchInlineSnapshot(`
      "> 1 | function foo() {const {[\\"a\\" + \\"b\\"]: v}: Rec = o;}
          |                        ^^^^^^^^^

      Computed key name not handled"
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

      Unhandled rest element for record destructuring"
    `);
  });
});

describe("while loops", () => {
  it("does not handle while loops", () => {
    expect(
      compileAndPrint(`
function foo() {
  while (true) {};
}
`),
    ).toMatchInlineSnapshot(`
      "  1 | 
        2 | function foo() {
      > 3 |   while (true) {};
          |  ^^^^^^^^^^^^^^^
        4 | }
        5 | 

      Unhandled syntax:
      {
        \\"type\\": \\"WhileStatement\\",
        \\"start\\": 20,
        \\"end\\": 35,
        \\"loc\\": {
          \\"start\\": {
            \\"line\\": 3,
            \\"column\\": 2
          },
          \\"end\\": {
            \\"line\\": 3,
            \\"column\\": 17
          }
        },
        \\"test\\": {
          \\"type\\": \\"BooleanLiteral\\",
          \\"start\\": 27,
          \\"end\\": 31,
          \\"loc\\": {
            \\"start\\": {
              \\"line\\": 3,
              \\"column\\": 9
            },
            \\"end\\": {
              \\"line\\": 3,
              \\"column\\": 13
            }
          },
          \\"value\\": true
        },
        \\"body\\": {
          \\"type\\": \\"BlockStatement\\",
          \\"start\\": 33,
          \\"end\\": 35,
          \\"loc\\": {
            \\"start\\": {
              \\"line\\": 3,
              \\"column\\": 15
            },
            \\"end\\": {
              \\"line\\": 3,
              \\"column\\": 17
            }
          },
          \\"body\\": [],
          \\"directives\\": []
        }
      }"
    `);
  });
});
