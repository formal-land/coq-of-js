// @flow
import {compileAndPrint} from "../index.js";

describe("type synonyms", () => {
  it("handles type synonyms of constants", () => {
    expect(
      compileAndPrint(
        `type b = boolean;
type s = string;
type v = void;
type n = null;
type f = number;
type o = {};
type e = empty;
`,
      ),
    ).toMatchInlineSnapshot(`
      "Definition b : Type := bool.

      Definition s : Type := string.

      Definition v : Type := unit.

      Definition n : Type := unit.

      Definition f : Type := Z.

      Definition o : Type := unit.

      Definition e : Type := Empty_set."
    `);
  });
});

describe("enums", () => {
  it("handles type definition of enums", () => {
    expect(compileAndPrint(`type SayHi = "hi" | 'hello' | "h";`))
      .toMatchInlineSnapshot(`
      "Module SayHi.
        Inductive t :=
        | hi
        | hello
        | h.
      End SayHi.
      Definition SayHi := SayHi.t."
    `);

    expect(compileAndPrint('type Single = "s";')).toMatchInlineSnapshot(`
      "Module Single.
        Inductive t :=
        | s.
      End Single.
      Definition Single := Single.t."
    `);
  });

  it("does not handle other elements than strings", () => {
    expect(compileAndPrint(`type SayHi = "hi" | 'hello' | 12;`))
      .toMatchInlineSnapshot(`
      "> 1 | type SayHi = \\"hi\\" | 'hello' | 12;
          |                              ^^

      Only strings are handled in enums"
    `);
  });

  it("does not handle other literals than string", () => {
    expect(compileAndPrint(`type Boo = false;`)).toMatchInlineSnapshot(`
      "> 1 | type Boo = false;
          |           ^^^^^

      Boolean literals in types are not handled"
    `);

    expect(compileAndPrint(`type Num = 12;`)).toMatchInlineSnapshot(`
      "> 1 | type Num = 12;
          |           ^^

      Number literals in types are not handled"
    `);
  });
});

describe("records", () => {
  it("does handle records", () => {
    expect(
      compileAndPrint(`type Status = {
  message: string,
  quantity: number,
};
`),
    ).toMatchInlineSnapshot(`
      "Module Status.
        Record t := {
          message : string;
          quantity : Z;
        }.
      End Status.
      Definition Status := Status.t."
    `);
  });

  it("does not handle spreads", () => {
    expect(
      compileAndPrint(`type Status = {
  message: string,
  quantity: number,
  ...A,
};
`),
    ).toMatchInlineSnapshot(`
      "  2 |   message: string,
        3 |   quantity: number,
      > 4 |   ...A,
          |  ^^^^
        5 | };
        6 | 

      Expected named property"
    `);
  });
});

describe("sum types", () => {
  it("handles sum types", () => {
    expect(
      compileAndPrint(`type Status =
  | {
      type: "Error",
      message: string,
    }
  | {
      type: "Loading",
    }
  | {
      type: "Nothing",
    }
  | {
      type: "Success",
      fresh: boolean,
      "value": string,
    };
`),
    ).toMatchInlineSnapshot(`
      "Module Status.
        Module Error.
          Record t := {
            message : string;
          }.
        End Error.

        Module Success.
          Record t := {
            fresh : bool;
            value : string;
          }.
        End Success.

        Inductive t :=
        | Error (_ : Error.t)
        | Loading (_ : unit)
        | Nothing (_ : unit)
        | Success (_ : Success.t).
      End Status.
      Definition Status := Status.t."
    `);

    expect(
      compileAndPrint(`type Status =
  | {
      type: "Error",
      message: string,
    };
`),
    ).toMatchInlineSnapshot(`
      "Module Status.
        Module Error.
          Record t := {
            message : string;
          }.
        End Error.

        Inductive t :=
        | Error (_ : Error.t).
      End Status.
      Definition Status := Status.t."
    `);
  });

  it("shows errors for sum types", () => {
    expect(
      compileAndPrint(`type Status =
  | {
      message: string,
    }
  | {
      type: "Loading",
    };
`),
    ).toMatchInlineSnapshot(`
      "  1 | type Status =
      > 2 |   | {
          |    ^
      > 3 |       message: string,
          | ^^^^^^^^^^^^^^^^^^^^^^
      > 4 |     }
          | ^^^^^
        5 |   | {
        6 |       type: \\"Loading\\",
        7 |     };

      Expected at least one field with the name \`type\`"
    `);

    expect(
      compileAndPrint(`type Status =
  | {
      type: "Error",
      message: string,
    }
  | {
      type: number,
    };
`),
    ).toMatchInlineSnapshot(`
      "  5 |     }
        6 |   | {
      > 7 |       type: number,
          |            ^^^^^^
        8 |     };
        9 | 

      Expected a string literal"
    `);

    expect(
      compileAndPrint(`type Status =
  | {
    type: "Spread",
      ...A,
    };
`),
    ).toMatchInlineSnapshot(`
      "  2 |   | {
        3 |     type: \\"Spread\\",
      > 4 |       ...A,
          |      ^^^^
        5 |     };
        6 | 

      Expected a named property"
    `);

    expect(
      compileAndPrint(`type Status =
  | {
    type: "Spread",
    }
  | string;
`),
    ).toMatchInlineSnapshot(`
      "  3 |     type: \\"Spread\\",
        4 |     }
      > 5 |   | string;
          |    ^^^^^^
        6 | 

      Only objects are handled in sum types"
    `);

    expect(compileAndPrint(`type Status = number | string;`))
      .toMatchInlineSnapshot(`
      "> 1 | type Status = number | string;
          |              ^^^^^^^^^^^^^^^

      Only handle unions of strings or objects with a \`type\` field"
    `);
  });
});

describe("existential types", () => {
  it("does not handle existential types", () => {
    expect(compileAndPrint(`type t = *;`)).toMatchInlineSnapshot(`
      "> 1 | type t = *;
          |         ^

      Unhandled syntax:
      {
        \\"type\\": \\"ExistsTypeAnnotation\\",
        \\"start\\": 9,
        \\"end\\": 10,
        \\"loc\\": {
          \\"start\\": {
            \\"line\\": 1,
            \\"column\\": 9
          },
          \\"end\\": {
            \\"line\\": 1,
            \\"column\\": 10
          }
        }
      }"
    `);
  });
});
