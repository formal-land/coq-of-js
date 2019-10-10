// @flow
import {compileAndPrint} from "../compiler/index.js";

it("can handle several errors", () => {
  expect(compileAndPrint(`const a1 = [,]; const a2 = [,];`)).toMatchSnapshot();
});
