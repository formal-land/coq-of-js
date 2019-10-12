// @flow
import {compileAndPrint} from "../index.js";

describe("merging of errors", () => {
  it("handles errors in several paths", () => {
    expect(
      compileAndPrint(`const a1 = [,]; const a2 = [,];`),
    ).toMatchSnapshot();
  });
});
