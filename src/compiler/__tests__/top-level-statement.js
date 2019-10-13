// @flow
import {compileAndPrint} from "../index.js";

describe("exports", () => {
  it("handles exports", () => {
    expect(compileAndPrint(`export const x = 12;`)).toMatchInlineSnapshot(`
      "Definition x :=
        12."
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

      Only handle imports from React for now"
    `);
  });
});

describe("definitions", () => {
  it("handles definitions of constants", () => {
    expect(compileAndPrint(`const n = 12;`)).toMatchInlineSnapshot(`
      "Definition n :=
        12."
    `);
  });

  it("handles definitions of functions", () => {
    expect(compileAndPrint(`function id<A>(x: A): A {return x;}`))
      .toMatchInlineSnapshot(`
      "Definition id {A : Type} (x : A) : A :=
        x."
    `);
  });

  it("does not handle destructuring of constants", () => {
    expect(compileAndPrint(`const [a, b] = [1, 2];`)).toMatchInlineSnapshot(`
      "> 1 | const [a, b] = [1, 2];
          |      ^^^^^^

      Expected simple identifier"
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
