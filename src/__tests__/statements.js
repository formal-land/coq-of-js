// @flow
import {compileAndPrint} from "../compiler/index.js";

it("handles empty statements", () => {
  expect(compileAndPrint(`function foo() {}`)).toMatchSnapshot();
});

it("handles empty returns", () => {
  expect(compileAndPrint(`function foo() {return;}`)).toMatchSnapshot();
});
