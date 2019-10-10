// @flow
import {compileAndPrint} from "../compiler/index.js";

it("handles empty statements", () => {
  expect(compileAndPrint(`function foo() {}`)).toMatchSnapshot();
});

it("handles empty returns", () => {
  expect(compileAndPrint(`function foo() {return;}`)).toMatchSnapshot();
});

it("requires a return if there is one statement", () => {
  expect(compileAndPrint(`function foo() {const n = 12;}`)).toMatchSnapshot();
});

it("fails with more than one statement", () => {
  expect(
    compileAndPrint(`function foo() {const n = 12; return;}`),
  ).toMatchSnapshot();
});
