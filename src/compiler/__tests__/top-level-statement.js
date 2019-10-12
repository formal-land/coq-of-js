// @flow
import {compileAndPrint} from "../index.js";

describe("exports", () => {
  it("handles exports", () => {
    expect(compileAndPrint(`export const x = 12;`)).toMatchSnapshot();
  });
});

describe("imports", () => {
  it("handles React import", () => {
    expect(
      compileAndPrint(`import React, {PureComponent} from "react";`),
    ).toMatchSnapshot();
  });

  it("does not handle non-React imports", () => {
    expect(compileAndPrint(`import express from "express";`)).toMatchSnapshot();
  });
});

describe("definitions", () => {
  it("handles definitions of constants", () => {
    expect(compileAndPrint(`const n = 12;`)).toMatchSnapshot();
  });

  it("handles definitions of functions", () => {
    expect(
      compileAndPrint(`function id<A>(x: A): A {return x;}`),
    ).toMatchSnapshot();
  });

  it("does not handle destructuring of constants", () => {
    expect(compileAndPrint(`const [a, b] = [1, 2];`)).toMatchSnapshot();
  });

  it("does not handle empty declarations", () => {
    expect(compileAndPrint(`let x;`)).toMatchSnapshot();
  });
});
