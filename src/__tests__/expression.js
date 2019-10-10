// @flow
import {compileAndPrint} from "../compiler/index.js";

it("requires function parameters to be simple names", () => {
  expect(compileAndPrint(`function foo({a}) {return a;}`)).toMatchSnapshot();
});

it("handles empty arrays", () => {
  expect(compileAndPrint(`const a = [];`)).toMatchSnapshot();
});

it("does not handle empty elements in arrays", () => {
  expect(compileAndPrint(`const a = [,];`)).toMatchSnapshot();
});

it("does not handle spreads in arrays", () => {
  expect(compileAndPrint(`const a = [...[]];`)).toMatchSnapshot();
});

it("does not handle calls with spread parameters", () => {
  expect(compileAndPrint(`const n = f(...a);`)).toMatchSnapshot();
});

it("handles nulls", () => {
  expect(compileAndPrint(`const n = null;`)).toMatchSnapshot();
});

it("handles empty objects", () => {
  expect(compileAndPrint(`const o = {};`)).toMatchSnapshot();
});

it("does not handle non-objects without annotations", () => {
  expect(compileAndPrint(`const o = {x: 12};`)).toMatchSnapshot();
});

it("handles enum instances", () => {
  expect(compileAndPrint(`const e = ("Green": Kind);`)).toMatchSnapshot();
});
