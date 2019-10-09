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
type e = empty;
`,
      40,
    ),
  ).toMatchSnapshot();
});

it("handle type definition of enums", () => {
  expect(
    compileAndPrint(
      `type SayHi = "hi" | 'hello' | "h";
`,
      40,
    ),
  ).toMatchSnapshot();

  expect(
    compileAndPrint(
      `type Single = "s";
`,
      40,
    ),
  ).toMatchSnapshot();
});

it("only handle enums of strings", () => {
  expect(
    compileAndPrint(
      `type SayHi = "hi" | 'hello' | 12;
`,
      40,
    ),
  ).toMatchSnapshot();
});
