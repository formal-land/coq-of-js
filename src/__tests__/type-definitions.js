// @flow
import {compileAndPrint} from "../compiler/index.js";

it("handle type synonyms of constants", () => {
  expect(
    compileAndPrint(
      `type b = boolean;
type s = string;
type v = void;
type n = null;
type f = number;
type o = {};
`,
      40,
    ),
  ).toMatchSnapshot();
});
