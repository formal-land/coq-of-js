// @flow
import {compileAndPrint} from "../index.js";

describe("unhandled types", () => {
  it("shows an error message on unhandled types", () => {
    expect(compileAndPrint(`const a: number | string = 12;`)).toMatchSnapshot();
  });
});
