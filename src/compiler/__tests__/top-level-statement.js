// @flow
import {compileAndPrint} from "../index.js";

describe("blocks", () => {
  it("does not handle blocks", () => {
    expect(compileAndPrint(`{}`)).toMatchInlineSnapshot(`
      "> 1 | {}
          | ^^

      Blocks are not handled at top-level"
    `);
  });
});

describe("classes", () => {
  it("does not handle class declarations", () => {
    expect(compileAndPrint(`class Foo {}`)).toMatchInlineSnapshot(`
      "> 1 | class Foo {}
          | ^^^^^^^^^^^^

      Class declarations are not handled"
    `);
  });
});

describe("debugger", () => {
  it("ignores debugger statements", () => {
    expect(compileAndPrint(`debugger;`)).toMatchInlineSnapshot(`""`);
  });
});

describe("declare", () => {
  it("ignores declare class", () => {
    expect(compileAndPrint(`declare class Foo {};`)).toMatchInlineSnapshot(
      `""`,
    );
  });

  it("ignores declare export all", () => {
    expect(
      compileAndPrint(`declare export * from "foo";`),
    ).toMatchInlineSnapshot(`""`);
  });

  it("ignores declare export", () => {
    expect(
      compileAndPrint(`declare export function foo(): void;`),
    ).toMatchInlineSnapshot(`""`);
  });

  it("ignores declare function", () => {
    expect(
      compileAndPrint(`declare function id<A>(x: A): A;`),
    ).toMatchInlineSnapshot(`""`);
  });

  it("ignores declare interface", () => {
    expect(compileAndPrint(`declare interface Foo {};`)).toMatchInlineSnapshot(
      `""`,
    );
  });

  it("ignores declare module", () => {
    expect(compileAndPrint(`declare module "foo" {};`)).toMatchInlineSnapshot(
      `""`,
    );
  });

  it("ignores declare module exports", () => {
    expect(
      compileAndPrint(`declare module.exports: {};`),
    ).toMatchInlineSnapshot(`""`);
  });

  it("ignores declare opaque type", () => {
    expect(compileAndPrint(`declare opaque type N;`)).toMatchInlineSnapshot(
      `""`,
    );
  });

  it("ignores declare type alias", () => {
    expect(compileAndPrint(`declare type N = number;`)).toMatchInlineSnapshot(
      `""`,
    );
  });

  it("ignores declare variable", () => {
    expect(compileAndPrint(`declare var n: number;`)).toMatchInlineSnapshot(
      `""`,
    );
  });
});

describe("do-while", () => {
  it("does not handle do-while loops", () => {
    expect(compileAndPrint(`do {} while (true)`)).toMatchInlineSnapshot(`
      "> 1 | do {} while (true)
          | ^^^^^^^^^^^^^^^^^^

      Do-while loops are not handled"
    `);
  });
});

describe("empty statements", () => {
  it("ignores empty statements", () => {
    expect(compileAndPrint(`;`)).toMatchInlineSnapshot(`""`);
  });
});

describe("exports", () => {
  it("does not handle export all", () => {
    expect(compileAndPrint(`export * from "foo";`)).toMatchInlineSnapshot(`
      "> 1 | export * from \\"foo\\";
          | ^^^^^^^^^^^^^^^^^^^^

      Export all are not handled"
    `);
  });

  it("does not handle export default", () => {
    expect(compileAndPrint(`export default 12;`)).toMatchInlineSnapshot(`
      "> 1 | export default 12;
          | ^^^^^^^^^^^^^^^^^^

      Export default is not handled"
    `);
  });

  it("does not handle exports from module", () => {
    expect(compileAndPrint(`export {a} from "foo";`)).toMatchInlineSnapshot(`
      "> 1 | export {a} from \\"foo\\";
          | ^^^^^^^^^^^^^^^^^^^^^^

      This kind of export is not handled"
    `);
  });

  it("handles named exports", () => {
    expect(compileAndPrint(`export const x = 12;`)).toMatchInlineSnapshot(`
      "Definition x :=
        12."
    `);
  });
});

describe("expressions", () => {
  it("does not handle top-level expressions", () => {
    expect(compileAndPrint(`1 + 2`)).toMatchInlineSnapshot(`
      "> 1 | 1 + 2
          | ^^^^^

      Top-level expressions are not handled"
    `);
  });
});

describe("for-in", () => {
  it("does not handle for-in loops", () => {
    expect(compileAndPrint(`for (const x in a) {}`)).toMatchInlineSnapshot(`
      "> 1 | for (const x in a) {}
          | ^^^^^^^^^^^^^^^^^^^^^

      For-in loops are not handled"
    `);
  });
});

describe("for-of", () => {
  it("does not handle for-of loops", () => {
    expect(compileAndPrint(`for (const x of a) {}`)).toMatchInlineSnapshot(`
      "> 1 | for (const x of a) {}
          | ^^^^^^^^^^^^^^^^^^^^^

      For-of loops are not handled"
    `);
  });
});

describe("for", () => {
  it("does not handle for loops", () => {
    expect(compileAndPrint(`for (;;) {}`)).toMatchInlineSnapshot(`
      "> 1 | for (;;) {}
          | ^^^^^^^^^^^

      For loops are not handled"
    `);
  });
});

describe("functions", () => {
  it("handles definitions of functions", () => {
    expect(compileAndPrint(`function id<A>(x: A): A {return x;}`))
      .toMatchInlineSnapshot(`
      "Definition id {A : Type} (x : A) : A :=
        x."
    `);
  });
});

describe("if", () => {
  it("does not handle top-level if", () => {
    expect(compileAndPrint(`if (true) {}`)).toMatchInlineSnapshot(`
      "> 1 | if (true) {}
          | ^^^^^^^^^^^^

      If at top-level are not handled"
    `);
  });
});

describe("imports", () => {
  it("handles React import", () => {
    expect(
      compileAndPrint(`import React, {PureComponent} from "react";`),
    ).toMatchInlineSnapshot(`""`);
  });

  it("does not handle non-React imports", () => {
    expect(compileAndPrint(`import express from "express";`))
      .toMatchInlineSnapshot(`
      "> 1 | import express from \\"express\\";
          | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      Only the imports from React are handled"
    `);
  });
});

describe("interface declarations", () => {
  it("does not handle interface declarations", () => {
    expect(compileAndPrint(`interface I {};`)).toMatchInlineSnapshot(`
      "> 1 | interface I {};
          | ^^^^^^^^^^^^^^

      Interface declarations are not handled"
    `);
  });
});

describe("labels", () => {
  it("does not handle labels", () => {
    expect(compileAndPrint(`foo: {}`)).toMatchInlineSnapshot(`
      "> 1 | foo: {}
          | ^^^^^^^

      Labeled statements are not handled"
    `);
  });
});

describe("opaque types", () => {
  it("handles opaque types", () => {
    expect(compileAndPrint(`opaque type t = number;`)).toMatchInlineSnapshot(
      `"Definition t : Type := Z."`,
    );
  });
});

describe("switch", () => {
  it("does not handle top-level switch", () => {
    expect(compileAndPrint(`switch (x) {}`)).toMatchInlineSnapshot(`
      "> 1 | switch (x) {}
          | ^^^^^^^^^^^^^

      Top-level switch are not handled"
    `);
  });
});

describe("throw", () => {
  it("does not handle throw", () => {
    expect(compileAndPrint(`throw error;`)).toMatchInlineSnapshot(`
      "> 1 | throw error;
          | ^^^^^^^^^^^^

      Throw statements are not handled"
    `);
  });
});

describe("try", () => {
  it("does not handle try statements", () => {
    expect(compileAndPrint(`try {} catch (error) {}`)).toMatchInlineSnapshot(`
      "> 1 | try {} catch (error) {}
          | ^^^^^^^^^^^^^^^^^^^^^^^

      Try statements are not handled"
    `);
  });
});

describe("variable definitions", () => {
  it("handles definitions of constants", () => {
    expect(compileAndPrint(`const n = 12;`)).toMatchInlineSnapshot(`
      "Definition n :=
        12."
    `);
  });

  it("does not handle destructuring of arrays", () => {
    expect(compileAndPrint(`const [a, b] = [1, 2];`)).toMatchInlineSnapshot(`
      "> 1 | const [a, b] = [1, 2];
          |      ^^^^^^

      Array destructuring at top-level is not allowed due to limitations in Coq"
    `);
  });

  it("does not handle destructuring of objects", () => {
    expect(compileAndPrint(`const {a, b} = o;`)).toMatchInlineSnapshot(`
      "> 1 | const {a, b} = o;
          |      ^^^^^^

      Object destructuring at top-level is not allowed due to limitations in Coq"
    `);
  });

  it("does not handle empty declarations", () => {
    expect(compileAndPrint(`let x;`)).toMatchInlineSnapshot(`
      "> 1 | let x;
          |    ^

      Expected definition"
    `);
  });
});

describe("while", () => {
  it("does not handle while loops", () => {
    expect(compileAndPrint(`while (true) {}`)).toMatchInlineSnapshot(`
      "> 1 | while (true) {}
          | ^^^^^^^^^^^^^^^

      While loops are not handled"
    `);
  });
});
